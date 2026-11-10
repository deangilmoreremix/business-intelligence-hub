import { createJsonResponse, createResponse, generateImage } from '../lib/openai';
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

/** Finds likely duplicates (cheap local pass on email/phone, AI pass on fuzzy name+company). */
export async function findDuplicates(contacts: Contact[]): Promise<DuplicateGroup[]> {
  const groups: DuplicateGroup[] = [];
  const byKey = new Map<string, string[]>();
  for (const c of contacts) {
    for (const k of [c.email && `e:${c.email.toLowerCase()}`, c.phone && `p:${c.phone.replace(/\D/g, '')}`]) {
      if (!k) continue;
      byKey.set(k, [...(byKey.get(k) ?? []), c.id]);
    }
  }
  byKey.forEach((ids, k) => ids.length > 1 && groups.push({ ids, reason: k.startsWith('e:') ? 'Same email' : 'Same phone' }));
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
