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

export const isOpenAIConfigured = (): boolean => true; // proxy holds the key; failures surface as errors

export class OpenAIError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'OpenAIError';
    this.status = status;
  }
}

async function post(endpoint: 'responses' | 'images/generations' | 'images/edits', body: unknown): Promise<any> {
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

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new OpenAIError(json?.error?.message || json?.error || res.statusText, res.status);
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
}

/** Calls the Responses API and returns the aggregated output text. */
export async function createResponse(opts: CreateResponseOptions): Promise<string> {
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

  const response = await post('responses', body);
  return extractOutputText(response);
}

/** Equivalent of the SDK's `output_text` helper, with refusal/incomplete handling. */
export function extractOutputText(response: any): string {
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

export async function createJsonResponse<T = any>(opts: CreateResponseOptions & { jsonSchema: JsonSchemaSpec }): Promise<T> {
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
    });

  let result;
  try {
    result = await run(opts.model || IMAGE_MODEL);
  } catch (e: any) {
    if (!opts.model && (e?.status === 404 || e?.status === 400) && /model/i.test(e.message)) {
      result = await run(IMAGE_MODEL_FALLBACK);
    } else {
      throw e;
    }
  }
  const b64 = result?.data?.[0]?.b64_json;
  if (!b64) throw new OpenAIError('No image returned');
  return `data:image/${format};base64,${b64}`;
}
