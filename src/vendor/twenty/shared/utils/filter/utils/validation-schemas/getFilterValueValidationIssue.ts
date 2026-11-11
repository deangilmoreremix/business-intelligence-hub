import {
  type FieldMetadataType,
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '../../../../types';
import { isRecordFilterValueValid } from '../../isRecordFilterValueValid';
import { convertViewFilterValueToString } from '../convertViewFilterValueToString';
import { getFilterTypeFromFieldType } from '../getFilterTypeFromFieldType';
import { FILTER_VALUE_FORMAT_HINTS } from './filterValueSchemasMap';
import { getFilterValueSchema } from './getFilterValueSchema';
import { isDefined } from '../../../validation/isDefined';

export type FilterValueValidationIssue = {
  stringifiedValue: string;
  operand: ViewFilterOperand;
  filterType: FilterableAndTSVectorFieldType;
  hint: string;
};

export const getFilterValueValidationIssue = ({
  fieldType,
  operand,
  subFieldName,
  value,
}: {
  fieldType: FieldMetadataType;
  operand: ViewFilterOperand;
  subFieldName?: string | null;
  value: unknown;
}): FilterValueValidationIssue | undefined => {
  const stringifiedValue = convertViewFilterValueToString(value);

  if (!isRecordFilterValueValid({ operand, value: stringifiedValue })) {
    return undefined;
  }

  const filterType = getFilterTypeFromFieldType(fieldType);

  const valueSchema = getFilterValueSchema({
    filterType,
    operand,
    subFieldName,
  });

  if (!isDefined(valueSchema)) {
    return undefined;
  }

  const parseResult = valueSchema.safeParse(stringifiedValue);

  if (parseResult.success) {
    return undefined;
  }

  return {
    stringifiedValue,
    operand,
    filterType,
    hint:
      FILTER_VALUE_FORMAT_HINTS[operand] ??
      parseResult.error.issues[0]?.message ??
      '',
  };
};
