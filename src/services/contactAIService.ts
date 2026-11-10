import { createJsonResponse, createResponse, createResponseFull, generateImage } from '../lib/openai';
import { supabase } from '../lib/supabase';
import type { Contact } from '../store/contactStore';

const str = { type: 'string' };

const describe = (c: Contact) =>
  JSON.stringify({
    name: c.name, email: c.email, company: c.company, phone: c.phone,
    status: c.crmStatus, createdAt: c.createdAt, updatedAt: c.updatedAt,
  });

export interface LeadScore {
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  reasons: string[];
  nextAction: string;
  summary: string;
}

/** AI lead scoring + relationship summary (Responses API, strict JSON schema). */
export async function scoreContact(contact: Contact, notes: string[] = []): Promise<LeadScore> {
  return createJsonResponse<LeadScore>({
    instructions: 'You are a CRM analyst. Score leads 0-100 from the data given; do not invent facts.',
    input: `Contact: ${describe(contact)}\nNotes:\n${notes.join('\n') || '(none)'}`,
    useCase: 'analysis',
    jsonSchema: {
      name: 'lead_score',
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          score: { type: 'integer' },
          tier: { type: 'string', enum: ['hot', 'warm', 'cold'] },
          reasons: { type: 'array', items: str },
          nextAction: str,
          summary: str,
        },
        required: ['score', 'tier', 'reasons', 'nextAction', 'summary'],
      },
    },
  });
}

export interface DuplicateGroup { ids: string[]; reason: string }

/**
 * Finds likely duplicates: exact email/phone locally, then an AI pass on fuzzy name+company
 * matches (nicknames, typos, "Bob"/"Robert") for contacts not already grouped.
 */
export async function findDuplicates(contacts: Contact[], useAI = true): Promise<DuplicateGroup[]> {
  const groups: DuplicateGroup[] = [];
  const grouped = new Set<string>();
  const byKey = new Map<string, string[]>();
  for (const c of contacts) {
    for (const k of [c.email && `e:${c.email.toLowerCase()}`, c.phone && c.phone.replace(/\D/g, '').length >= 7 && `p:${c.phone.replace(/\D/g, '')}`]) {
      if (!k) continue;
      byKey.set(k, [...(byKey.get(k) ?? []), c.id]);
    }
  }
  byKey.forEach((ids, k) => {
    const fresh = ids.filter(i => !grouped.has(i));
    if (fresh.length > 1) { groups.push({ ids: fresh, reason: k.startsWith('e:') ? 'Same email' : 'Same phone' }); fresh.forEach(i => grouped.add(i)); }
  });
  if (!useAI) return groups;

  const rest = contacts.filter(c => !grouped.has(c.id)).slice(0, 150);
  if (rest.length < 2) return groups;
  const ai = await createJsonResponse<{ groups: Array<{ ids: string[]; reason: string }> }>({
    instructions: 'Find groups of CRM contacts that are very likely the SAME person (typos, nicknames, same name at same company). Only group when confident. Use only the ids provided.',
    input: JSON.stringify(rest.map(c => ({ id: c.id, name: c.name, email: c.email, company: c.company, phone: c.phone }))),
    useCase: 'analysis',
    jsonSchema: {
      name: 'duplicate_groups',
      schema: {
        type: 'object', additionalProperties: false, required: ['groups'],
        properties: { groups: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ids', 'reason'], properties: { ids: { type: 'array', items: str }, reason: str } } } },
      },
    },
  });
  const valid = new Set(rest.map(c => c.id));
  for (const g of ai.groups ?? []) {
    const ids = Array.from(new Set(g.ids)).filter(i => valid.has(i) && !grouped.has(i));
    if (ids.length > 1) { groups.push({ ids, reason: `AI: ${g.reason}` }); ids.forEach(i => grouped.add(i)); }
  }
  return groups;
}

export async function draftEmail(contact: Contact, goal: string): Promise<{ subject: string; body: string }> {
  return createJsonResponse({
    instructions: 'Write concise, friendly, professional sales emails. No placeholders left unfilled.',
    input: `Recipient: ${describe(contact)}\nGoal: ${goal}`,
    useCase: 'chatbot',
    jsonSchema: {
      name: 'email_draft',
      schema: { type: 'object', additionalProperties: false, properties: { subject: str, body: str }, required: ['subject', 'body'] },
    },
  });
}

export async function askAboutContacts(question: string, contacts: Contact[]): Promise<string> {
  return createResponse({
    instructions: 'Answer questions about the provided CRM contacts only. Be concise.',
    input: `Contacts: ${JSON.stringify(contacts.slice(0, 200).map(describe))}\n\nQuestion: ${question}`,
    useCase: 'analysis',
  });
}

/** GPT Image: branded avatar/illustration for a contact or company (returns data URL). */
export async function generateContactAvatar(contact: Contact): Promise<string> {
  return generateImage({
    prompt: `Friendly, professional flat-style avatar illustration for a business contact named "${contact.name}"${contact.company ? ` at ${contact.company}` : ''}. Plain background, no text.`,
    size: '1024x1024',
    quality: 'low',
    model: undefined,
  });
}

export interface EnrichmentResult {
  found: boolean;
  confidence: 'high' | 'medium' | 'low';
  jobTitle: string;
  company: string;
  companyWebsite: string;
  industry: string;
  city: string;
  linkedinUrl: string;
  twitterUrl: string;
  website: string;
  bio: string;
  notes: string;
  sources: string[];
}

const nullableStr = { type: 'string' };

/**
 * Enrich a contact from PUBLIC web information using the Responses API `web_search` tool.
 * Returns proposed values (empty string = not found) plus the source URLs; nothing is saved here.
 */
export async function enrichContact(contact: Contact): Promise<EnrichmentResult> {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      found: { type: 'boolean' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      jobTitle: nullableStr, company: nullableStr, companyWebsite: nullableStr, industry: nullableStr,
      city: nullableStr, linkedinUrl: nullableStr, twitterUrl: nullableStr, website: nullableStr,
      bio: nullableStr, notes: nullableStr,
    },
    required: ['found', 'confidence', 'jobTitle', 'company', 'companyWebsite', 'industry', 'city', 'linkedinUrl', 'twitterUrl', 'website', 'bio', 'notes'],
  };

  const instructions =
    'You enrich CRM contacts using ONLY public, professional information found via web search. ' +
    'Never include home addresses, personal phone numbers, family, health, or other private details. ' +
    'Only report facts you can attribute to a source and that clearly refer to THIS person (match name AND company/email domain). ' +
    'If unsure, set found=false or leave fields as empty strings. Do not guess URLs.';
  const input = `Find public professional information for this contact and return JSON.\n${describe(contact)}\nEmail domain: ${contact.email?.split('@')[1] ?? 'unknown'}`;
  const base = {
    instructions,
    input,
    useCase: 'analysis' as const,
    tools: [{ type: 'web_search', search_context_size: 'medium' }],
    toolChoice: 'required' as const,
    include: ['web_search_call.action.sources'],
  };

  let res;
  try {
    res = await createResponseFull({ ...base, jsonSchema: { name: 'contact_enrichment', schema } });
  } catch (e) {
    // Fallback if the model/tool combo rejects structured output: ask for plain JSON.
    if ((e as { status?: number })?.status !== 400) throw e;
    res = await createResponseFull({ ...base, input: `${input}\nRespond with ONLY a JSON object with keys: ${Object.keys(schema.properties).join(', ')}.` });
  }
  const json = res.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error('Enrichment returned no data');
  const parsed = JSON.parse(json) as Omit<EnrichmentResult, 'sources'>;
  const sources = [...new Set([...res.citations.map(c => c.url), ...res.sources])].slice(0, 15);
  return { ...parsed, sources };
}

const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);
const isHttp = (v?: string) => !!v && /^https?:\/\//i.test(v);

/** Persists accepted enrichment fields. Only fills values you pass in `accept`. */
export async function applyEnrichment(contactId: string, r: EnrichmentResult, accept: Array<keyof EnrichmentResult>) {
  const map: Record<string, [string, string | undefined]> = {
    jobTitle: ['job_title', clean(r.jobTitle)],
    company: ['company', clean(r.company)],
    city: ['city', clean(r.city)],
    linkedinUrl: ['linkedin_url', isHttp(r.linkedinUrl) ? r.linkedinUrl : undefined],
    twitterUrl: ['twitter_url', isHttp(r.twitterUrl) ? r.twitterUrl : undefined],
    website: ['website', isHttp(r.website) ? r.website : undefined],
    bio: ['bio', clean(r.bio)],
  };
  const patch: Record<string, unknown> = { enrichment: r, enriched_at: new Date().toISOString() };
  for (const k of accept) { const m = map[k as string]; if (m?.[1]) patch[m[0]] = m[1]; }
  const { error } = await supabase.from('contacts').update(patch).eq('id', contactId);
  if (error) throw new Error(error.message);
  await supabase.from('contact_activities').insert({ contact_id: contactId, kind: 'enriched', detail: `Sources: ${r.sources.join(', ')}` });
}
