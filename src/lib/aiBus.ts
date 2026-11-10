import type { AIAnalysisResult } from '../services/aiService';

/**
 * Lets a page's own "Analyze / Optimize / Generate" button trigger the real OpenAI analysis
 * rendered by that page's <AIAnalysisSection appId="..."/>, and await the outcome.
 * Resolves with the result (or null on error / when no section is mounted for the app).
 */
export const AI_RUN_EVENT = 'ai-analysis:run';

export interface AIRunDetail {
  appId: string;
  handled: boolean;
  done: (result: AIAnalysisResult | null) => void;
}

export function runAIAnalysis(appId: string): Promise<AIAnalysisResult | null> {
  return new Promise(resolve => {
    const detail: AIRunDetail = { appId, handled: false, done: resolve };
    window.dispatchEvent(new CustomEvent<AIRunDetail>(AI_RUN_EVENT, { detail }));
    if (!detail.handled) resolve(null);
  });
}
