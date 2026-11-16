/** CSV parsing + validation for contact import (RFC 4180 style: quoted fields, embedded commas/newlines/quotes, BOM, CRLF). */

export type CrmStatus = 'lead' | 'prospect' | 'customer' | 'inactive';
export interface ImportRow { firstName: string; lastName: string; email: string | null; phone: string | null; company: string | null; crmStatus: CrmStatus }
export interface SkippedRow { line: number; reason: string }
export interface ParsedImport { rows: ImportRow[]; skipped: SkippedRow[] }

const STATUSES: CrmStatus[] = ['lead', 'prospect', 'customer', 'inactive'];
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;
const MAX_ROWS = 5000;
const MAX_FIELD = 300;

/** Splits CSV text into records of cells, honouring quotes. Each record carries its 1-based starting line. */
export function parseCsvRecords(input: string): Array<{ line: number; cells: string[] }> {
  const text = input.replace(/^\uFEFF/, '');
  const out: Array<{ line: number; cells: string[] }> = [];
  let cells: string[] = [], cell = '', inQ = false, line = 1, startLine = 1;
  const endCell = () => { cells.push(cell); cell = ''; };
  const endRecord = () => {
    endCell();
    if (cells.some(c => c.trim() !== '')) out.push({ line: startLine, cells });
    cells = []; startLine = line + 1;
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false; }
      else { if (ch === '\n') line++; cell += ch; }
    } else if (ch === '"' && cell === '') inQ = true;
    else if (ch === ',') endCell();
    else if (ch === '\r') { /* ignore, \n ends the record */ }
    else if (ch === '\n') { endRecord(); line++; startLine = line; }
    else cell += ch;
  }
  if (cell !== '' || cells.length) endRecord();
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const ALIASES: Record<string, string[]> = {
  firstName: ['firstname', 'first', 'givenname'],
  lastName: ['lastname', 'last', 'surname', 'familyname'],
  email: ['email', 'emailaddress', 'mail'],
  phone: ['phone', 'phonenumber', 'mobile', 'tel'],
  company: ['company', 'organization', 'organisation', 'employer'],
  status: ['status', 'crmstatus', 'stage'],
};
const DEFAULT_ORDER = ['firstName', 'lastName', 'email', 'phone', 'company', 'status'];

/** Parses and validates a contacts CSV. A header row is detected by name; without one the columns are first,last,email,phone,company,status. */
export function parseContactsCsv(text: string): ParsedImport {
  const records = parseCsvRecords(text);
  const skipped: SkippedRow[] = [];
  if (!records.length) return { rows: [], skipped };

  let colOf: Record<string, number> = Object.fromEntries(DEFAULT_ORDER.map((k, i) => [k, i]));
  let body = records;
  const headerNames = records[0].cells.map(norm);
  const looksLikeHeader = headerNames.some(h => Object.values(ALIASES).flat().includes(h)) && !records[0].cells.some(c => EMAIL_RE.test(c.trim()));
  if (looksLikeHeader) {
    colOf = {};
    for (const [key, names] of Object.entries(ALIASES)) {
      const idx = headerNames.findIndex(h => names.includes(h));
      if (idx >= 0) colOf[key] = idx;
    }
    body = records.slice(1);
  }
  if (body.length > MAX_ROWS) { body.slice(MAX_ROWS).forEach(r => skipped.push({ line: r.line, reason: `over the ${MAX_ROWS}-row limit` })); body = body.slice(0, MAX_ROWS); }

  const seen = new Set<string>();
  const rows: ImportRow[] = [];
  for (const r of body) {
    const get = (k: string) => (colOf[k] === undefined ? '' : (r.cells[colOf[k]] ?? '').trim());
    const firstName = get('firstName');
    const lastName = get('lastName');
    const email = get('email').toLowerCase();
    const statusRaw = get('status').toLowerCase();
    if (!firstName) { skipped.push({ line: r.line, reason: 'missing first name' }); continue; }
    if ([firstName, lastName, email, get('phone'), get('company')].some(v => v.length > MAX_FIELD)) { skipped.push({ line: r.line, reason: 'a value is longer than 300 characters' }); continue; }
    if (email && !EMAIL_RE.test(email)) { skipped.push({ line: r.line, reason: `invalid email "${email.slice(0, 40)}"` }); continue; }
    if (statusRaw && !STATUSES.includes(statusRaw as CrmStatus)) { skipped.push({ line: r.line, reason: `unknown status "${statusRaw.slice(0, 20)}"` }); continue; }
    if (email) { if (seen.has(email)) { skipped.push({ line: r.line, reason: `duplicate email in file (${email})` }); continue; } seen.add(email); }
    rows.push({ firstName, lastName, email: email || null, phone: get('phone') || null, company: get('company') || null, crmStatus: (statusRaw as CrmStatus) || 'lead' });
  }
  return { rows, skipped };
}
