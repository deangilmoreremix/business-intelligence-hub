import { validationRuleNullPlaceholders } from './validationRuleValueRegistry';
import { isDefined } from '../validation/isDefined';

export const isValidationRuleValueDefined = (
  value: unknown,
): value is NonNullable<unknown> =>
  isDefined(value) &&
  !(typeof value === 'object' && validationRuleNullPlaceholders.has(value));
