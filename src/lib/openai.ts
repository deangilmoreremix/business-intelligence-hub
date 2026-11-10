/**
 * Central OpenAI client (Responses API + Images API).
 *
 * Requests go through the Netlify Function at /.netlify/functions/openai-proxy so the
 * API key stays server-side (OPENAI_API_KEY). For local `vite` dev without
 * `netlify dev`, set VITE_OPENAI_API_KEY to call api.openai.com directly (dev only).
 */

const DIRECT_KEY: string | undefined = import.meta.env.VITE_OPENAI_API_KEY;
const PROXY_URL: string = import.meta.env.VITE_AI_PROXY_URL || '/.netlify/functions/openai-proxy';
const OPENAI_BASE = 'https://api.openai.com/v1';

export const MODELS = {
  ASTRA: 'gpt-6-astra', // highest intelligence
  SOL: 'gpt-6.1-sol',
  TERRA: 'gpt-6.1-terra', // faster / cheaper
  LUNA: 'gpt-6-luna',
} as const;

export const OPENAI_MODEL: string = import.meta.env.VITE_OPENAI_MODEL || MODELS.ASTRA;
export const OPENAI_FAST_MODEL: string = import.meta.env.VITE_OPENAI_FAST_MODEL || MODELS.TERRA;

// GPT Image 2.6 (Sunburst = precision/editing, Flare = fast generation).
// Exact API ID is configurable; we fall back to 2.5 if the 2.6 ID is rejected.
export const IMAGE_MODEL: string = import.meta.env.VITE_OPENAI_IMAGE_MODEL || 'gpt-image-2.6-sunburst';
export const IMAGE_MODEL_FALLBACK = 'gpt-image-2.5-sunburst';

export type ReasoningEffort = 'low' | 'medium' | 'high';
export type Verbosity = 'low' | 'medium' | 'high';
export type UseCase = 'chatbot' | 'analysis' | 'complex';

// `none` / `minimal` are not supported on GPT-6 Astra / 6.1 Sol, so never emitted.
const USE_CASE_CONFIG: Record<UseCase, { effort: ReasoningEffort; verbosity: Verbosity }> = {
  chatbot: { effort: 'low', verbosity: 'medium' },
  analysis: { effort: 'medium', verbosity: 'medium' },
  complex: { effort: 'high', verbosity: 'high' },
};

/** Asks the proxy whether OPENAI_API_KEY is configured (cached for the session). */
let availability: Promise<boolean> | null = null;
export const checkAIAvailable = (): Promise<boolean> => {
  if (DIRECT_KEY && import.meta.env.DEV) return Promise.resolve(true);
  availability ??= fetch(PROXY_URL)
    .then(r => (r.ok ? r.json() : { configured: false }))
    .then(j => Boolean(j?.configured))
    .catch(() => false);
  return availability;
};
export const AI_NOT_CONFIGURED_MESSAGE =
  'AI is not configured. Set OPENAI_API_KEY in your Netlify environment variables (or run `netlify dev`).';

/** Minimal shape of an OpenAI Responses API result (only fields we read). */
export interface ResponsesResult {
  status?: string;
  output_text?: string;
  incomplete_details?: { reason?: string };
  output?: Array<{
    type: string;
    action?: { sources?: Array<{ url?: string }> };
    content?: Array<{
      type: string;
      text?: string;
      refusal?: string;
      annotations?: Array<{ type: string; url?: string; title?: string }>;
    }>;
  }>;
}

interface ApiError { error?: { message?: string } | string }

export class OpenAIError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'OpenAIError';
    this.status = status;
  }
}

async function post(endpoint: 'responses' | 'images/generations' | 'images/edits', body: unknown): Promise<Record<string, unknown>> {
  const useDirect = Boolean(DIRECT_KEY) && import.meta.env.DEV;
  const res = useDirect
    ? await fetch(`${OPENAI_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DIRECT_KEY}` },
        body: JSON.stringify(body),
      })
    : await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, body }),
      });

  const json = (await res.json().catch(() => ({}))) as ApiError & Record<string, unknown>;
  if (!res.ok) {
    const e = json?.error;
    throw new OpenAIError((typeof e === 'string' ? e : e?.message) || res.statusText, res.status);
  }
  return json;
}

export interface JsonSchemaSpec {
  name: string;
  schema: Record<string, unknown>; // must be strict-compatible (additionalProperties:false, all keys required)
}

export interface CreateResponseOptions {
  input: string | Array<{ role: 'user' | 'assistant' | 'developer'; content: string }>;
  instructions?: string;
  jsonSchema?: JsonSchemaSpec;
  useCase?: UseCase;
  model?: string;
  maxOutputTokens?: number;
  /** Responses API tools, e.g. [{ type: 'web_search' }]. */
  tools?: Array<Record<string, unknown>>;
  toolChoice?: 'auto' | 'required' | 'none';
  include?: string[];
}

export interface Citation { url: string; title?: string }
export interface FullResponse { text: string; citations: Citation[]; sources: string[] }

/** Calls the Responses API and returns the aggregated output text. */
export async function createResponse(opts: CreateResponseOptions): Promise<string> {
  return (await createResponseFull(opts)).text;
}

/** Like createResponse but also returns url_citation annotations and consulted web sources. */
export async function createResponseFull(opts: CreateResponseOptions): Promise<FullResponse> {
  if (!(await checkAIAvailable())) throw new OpenAIError(AI_NOT_CONFIGURED_MESSAGE, 503);
  const cfg = USE_CASE_CONFIG[opts.useCase ?? 'analysis'];
  const text: Record<string, unknown> = { verbosity: cfg.verbosity };
  if (opts.jsonSchema) {
    text.format = { type: 'json_schema', name: opts.jsonSchema.name, schema: opts.jsonSchema.schema, strict: true };
  }

  // No temperature/top_p: unsupported when reasoning is enabled.
  const body: Record<string, unknown> = {
    model: opts.model || OPENAI_MODEL,
    input: opts.input,
    reasoning: { effort: cfg.effort },
    text,
    store: false,
  };
  if (opts.instructions) body.instructions = opts.instructions;
  if (opts.maxOutputTokens) body.max_output_tokens = opts.maxOutputTokens;

  if (opts.tools?.length) body.tools = opts.tools;
  if (opts.toolChoice) body.tool_choice = opts.toolChoice;
  if (opts.include?.length) body.include = opts.include;

  const response = (await post('responses', body)) as ResponsesResult;
  return { text: extractOutputText(response), ...extractSources(response) };
}

export function extractSources(response: ResponsesResult): { citations: Citation[]; sources: string[] } {
  const citations = new Map<string, Citation>();
  const sources = new Set<string>();
  for (const item of response?.output ?? []) {
    if (item?.type === 'web_search_call') {
      for (const src of item.action?.sources ?? []) if (src?.url) sources.add(src.url);
    }
    if (item?.type === 'message') {
      for (const c of item.content ?? []) {
        for (const a of c.annotations ?? []) {
          if (a?.type === 'url_citation' && a.url) citations.set(a.url, { url: a.url, title: a.title });
        }
      }
    }
  }
  return { citations: [...citations.values()], sources: [...sources] };
}

/** Equivalent of the SDK's `output_text` helper, with refusal/incomplete handling. */
export function extractOutputText(response: ResponsesResult): string {
  if (typeof response?.output_text === 'string' && response.output_text) return response.output_text;
  let out = '';
  for (const item of response?.output ?? []) {
    if (item?.type !== 'message') continue;
    for (const c of item.content ?? []) {
      if (c.type === 'refusal') throw new OpenAIError(`Model refused: ${c.refusal}`);
      if (c.type === 'output_text') out += c.text ?? '';
    }
  }
  if (!out && response?.status === 'incomplete') {
    throw new OpenAIError(`Response incomplete: ${response.incomplete_details?.reason ?? 'unknown'}`);
  }
  return out;
}

export async function createJsonResponse<T = unknown>(opts: CreateResponseOptions & { jsonSchema: JsonSchemaSpec }): Promise<T> {
  const text = await createResponse(opts);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new OpenAIError('Model returned invalid JSON');
  }
}

export interface GenerateImageOptions {
  prompt: string;
  size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'auto';
  format?: 'png' | 'jpeg' | 'webp';
  model?: string;
}

/** Generates an image with GPT Image; returns a data: URL. */
export async function generateImage(opts: GenerateImageOptions): Promise<string> {
  const format = opts.format ?? 'png';
  const run = (model: string) =>
    post('images/generations', {
      model,
      prompt: opts.prompt,
      size: opts.size ?? '1024x1024',
      quality: opts.quality ?? 'auto',
      output_format: format,
    }) as Promise<{ data?: Array<{ b64_json?: string }> }>;

  let result: { data?: Array<{ b64_json?: string }> };
  try {
    result = await run(opts.model || IMAGE_MODEL);
  } catch (e) {
    const err = e as OpenAIError;
    if (!opts.model && (err?.status === 404 || err?.status === 400) && /model/i.test(err.message)) {
      result = await run(IMAGE_MODEL_FALLBACK);
    } else {
      throw e;
    }
  }
  const b64 = result?.data?.[0]?.b64_json;
  if (!b64) throw new OpenAIError('No image returned');
  return `data:image/${format};base64,${b64}`;
}
