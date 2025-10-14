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
  // GPT-5 models (Responses API with reasoning)
  GPT5: 'gpt-5',
  GPT5_THINKING: 'gpt-5-thinking',
  GPT5_MINI: 'gpt-5-mini',

  // Current best models (GPT-4 optimized)
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',

  // Legacy
  GPT4_TURBO: 'gpt-4-turbo',
  GPT4: 'gpt-4',
} as const;

// GPT-5 reasoning effort levels
export const REASONING_EFFORT = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// GPT-5 verbosity levels
export const VERBOSITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Check if model is GPT-5 family
export const isGPT5Model = (model: string): boolean => {
  return model.startsWith('gpt-5');
};

// Get optimal GPT-5 parameters based on use case
export const getGPT5Config = (useCase: 'chatbot' | 'analysis' | 'complex') => {
  switch (useCase) {
    case 'chatbot':
      return {
        reasoning: { effort: REASONING_EFFORT.LOW },
        text: { verbosity: VERBOSITY.MEDIUM },
      };
    case 'analysis':
      return {
        reasoning: { effort: REASONING_EFFORT.MEDIUM },
        text: { verbosity: VERBOSITY.MEDIUM },
      };
    case 'complex':
      return {
        reasoning: { effort: REASONING_EFFORT.HIGH },
        text: { verbosity: VERBOSITY.HIGH },
      };
    default:
      return {
        reasoning: { effort: REASONING_EFFORT.MEDIUM },
        text: { verbosity: VERBOSITY.MEDIUM },
      };
  }
};

export const isOpenAIConfigured = (): boolean => {
  return Boolean(apiKey && apiKey !== 'dummy-key');
};
