import { type FieldLinksVariant } from '../../types/FieldMetadataSettings';
import { normalizeDomain } from './normalizeDomain';
import { normalizeUrlOrigin } from './normalizeUrlOrigin';

export const getLinkUrlNormalizer = (
  linksVariant: FieldLinksVariant | undefined,
): ((url: string) => string) =>
  linksVariant === 'domain' ? normalizeDomain : normalizeUrlOrigin;
