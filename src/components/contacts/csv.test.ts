import { describe, expect, it } from 'vitest';
import { parseContactsCsv, parseCsvRecords } from './csv';

describe('parseCsvRecords', () => {
  it('handles quotes, embedded commas, escaped quotes, CRLF and BOM', () => {
    const r = parseCsvRecords('﻿a,b\r\n"x, y","He said ""hi"""\r\n');
    expect(r.map(x => x.cells)).toEqual([['a', 'b'], ['x, y', 'He said "hi"']]);
  });
  it('keeps newlines inside quoted cells and tracks line numbers', () => {
    const r = parseCsvRecords('a\n"multi\nline",1\nz,2');
    expect(r[1].cells[0]).toBe('multi\nline');
    expect(r[2].line).toBe(4);
  });
  it('skips blank lines and handles a missing final newline', () => {
    expect(parseCsvRecords('a,b\n\n\nc,d').length).toBe(2);
  });
});

describe('parseContactsCsv', () => {
  it('reads a header row by name in any order, case-insensitively', () => {
    const { rows, skipped } = parseContactsCsv('Email,First Name,Company\nANN@X.COM,Ann,"Acme, Inc"\n');
    expect(skipped).toEqual([]);
    expect(rows[0]).toMatchObject({ firstName: 'Ann', email: 'ann@x.com', company: 'Acme, Inc', crmStatus: 'lead' });
  });
  it('treats a headerless file as first,last,email,phone,company,status', () => {
    const { rows } = parseContactsCsv('Jane,Doe,jane@acme.com,555,Acme,customer');
    expect(rows[0]).toMatchObject({ firstName: 'Jane', lastName: 'Doe', crmStatus: 'customer' });
  });
  it('skips and explains invalid rows', () => {
    const { rows, skipped } = parseContactsCsv('first_name,last_name,email,status\n,NoFirst,a@b.co,lead\nBad,Email,not-an-email,lead\nBad,Status,s@b.co,vip\nOk,One,ok@b.co,prospect\nDup,Two,ok@b.co,lead\n');
    expect(rows.map(r => r.firstName)).toEqual(['Ok']);
    expect(skipped.map(s => s.reason.split(' ')[0])).toEqual(['missing', 'invalid', 'unknown', 'duplicate']);
    expect(skipped.map(s => s.line)).toEqual([2, 3, 4, 6]);
  });
  it('returns nothing for an empty file', () => {
    expect(parseContactsCsv('')).toEqual({ rows: [], skipped: [] });
  });
});
