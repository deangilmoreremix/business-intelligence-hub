import { type z } from 'zod';

import {
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '../../../../types';
import { isRecordFilterOperandExpectingValue } from '../../isRecordFilterOperandExpectingValue';
import { isDefined } from '../../../validation/isDefined';
import {
  COMPOSITE_SUB_FIELD_VALUE_SCHEMAS,
  FILTER_VALUE_SCHEMAS_MAP,
} from './filterValueSchemasMap';

type OperandSchemas = Partial<Record<ViewFilterOperand, z.ZodType>>;

export const getFilterValueSchema = ({
  filterType,
  operand,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  operand: ViewFilterOperand;
  subFieldName?: string | null | undefined;
}): z.ZodType | undefined => {
  if (!isRecordFilterOperandExpectingValue(operand)) {
    return undefined;
  }

  const subFieldSchemas: Record<string, OperandSchemas> | undefined =
    COMPOSITE_SUB_FIELD_VALUE_SCHEMAS[
      filterType as keyof typeof COMPOSITE_SUB_FIELD_VALUE_SCHEMAS
    ];

  if (isDefined(subFieldName) && isDefined(subFieldSchemas?.[subFieldName])) {
    return subFieldSchemas[subFieldName][operand];
  }

  return (FILTER_VALUE_SCHEMAS_MAP[filterType] as OperandSchemas)[operand];
};
