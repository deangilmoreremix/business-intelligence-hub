import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not configured. AI functionality will be limited.');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true
});

// Default to best available model (GPT-5 when available, currently gpt-4o)
export const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o';

// Model aliases for easy upgrades
export const MODELS = {
  // GPT-5 models (use when available)
  GPT5: 'gpt-5',
  GPT5_MINI: 'gpt-5-mini',

  // Current best models (GPT-4 optimized)
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',

  // Legacy
  GPT4_TURBO: 'gpt-4-turbo',
  GPT4: 'gpt-4',
} as const;

export const isOpenAIConfigured = (): boolean => {
  return Boolean(apiKey && apiKey !== 'dummy-key');
};
