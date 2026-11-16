import { describe, expect, it } from 'vitest';
import { searchPattern } from './contactService';

describe('searchPattern', () => {
  it('wraps in wildcards and quotes', () => { expect(searchPattern('  smith ')).toBe('"*smith*"'); });
  it('keeps commas and parentheses inside the quotes', () => { expect(searchPattern('a,b)(c')).toBe('"*a,b)(c*"'); });
  it('escapes quotes and backslashes', () => { expect(searchPattern('a"b\\c')).toBe('"*a\\"b\\\\c*"'); });
});
