import { isValidHostname } from './isValidHostname';
import { normalizeDomain } from './normalizeDomain';

export const isValidDomain = (rawDomain: string): boolean =>
  isValidHostname(normalizeDomain(rawDomain), {
    allowLocalhost: false,
    allowIp: false,
  });
