import { type RelativeDateFilterUnit } from './relativeDateFilterUnitSchema';

const SUB_DAY_RELATIVE_DATE_FILTER_UNITS: readonly RelativeDateFilterUnit[] = [
  'SECOND',
  'MINUTE',
  'HOUR',
];

export const isSubDayRelativeDateFilterUnit = (
  unit: RelativeDateFilterUnit,
): boolean => SUB_DAY_RELATIVE_DATE_FILTER_UNITS.includes(unit);
