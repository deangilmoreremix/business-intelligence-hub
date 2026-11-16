import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The stack is OpenAI only (via the Netlify proxy). This guard fails if another AI provider creeps in.
const FORBIDDEN = /gemini|generativelanguage|@google\/generative-ai|@google\/genai/i;
const SELF = 'no-other-providers.test.ts';

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (p.includes(join('src', 'vendor', 'twenty'))) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mts|json|toml)$/.test(name) && name !== SELF) out.push(p);
  }
  return out;
};

describe('OpenAI-only stack', () => {
  it('has no references to other AI providers in app code, functions or package.json', () => {
    const files = [...walk('src'), ...walk('netlify'), 'package.json'];
    const hits = files.filter(f => FORBIDDEN.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });
});
