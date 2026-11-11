import { getUrlSafely } from '../getUrlSafely';
import { isAbsoluteUrl } from './isAbsoluteUrl';
import { isDefined } from '../validation/isDefined';

export const isHttpUrl = (url: string): boolean =>
  isAbsoluteUrl(url) && isDefined(getUrlSafely(url));
