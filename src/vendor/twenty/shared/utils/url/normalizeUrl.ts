import { ensureAbsoluteUrl } from './ensureAbsoluteUrl';
import { normalizeUrlOrigin } from './normalizeUrlOrigin';

export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();

  if (trimmed === '') {
    return trimmed;
  }

  return normalizeUrlOrigin(ensureAbsoluteUrl(trimmed));
};
