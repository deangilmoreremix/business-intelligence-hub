// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { ViewFilterOperand } from 'twenty-shared/types';
import { chartFilterToGql, objectFromMetadataId } from './chartData';
import { getObjectId } from './metadata';
import { toTwentyWidget, defaultWidget, type FilterRow } from '../../components/dashboard-builder/model';

const obj = objectFromMetadataId(getObjectId('contact'));
const UUID = '3f2b1c4e-8a77-4c3e-9d11-5b0e6a2c9f10';
const gql = (row: FilterRow) => {
  const w = defaultWidget('pie', 'contact');
  w.options.filters = [row];
  return chartFilterToGql(toTwentyWidget(w).configuration as never, obj);
};

describe('builder filter rows -> Twenty recordFilters -> RPC filter JSON (operators the SQL function supports)', () => {
  const cases: Array<[FilterRow, unknown]> = [
    [{ field: 'firstName', operand: ViewFilterOperand.CONTAINS, value: 'ann' }, { firstName: { ilike: '%ann%' } }],
    [{ field: 'firstName', operand: ViewFilterOperand.DOES_NOT_CONTAIN, value: 'ann' }, { not: { firstName: { ilike: '%ann%' } } }],
    [{ field: 'email', operand: ViewFilterOperand.IS_EMPTY, value: '' }, { or: [{ email: { ilike: '' } }, { email: { is: 'NULL' } }] }],
    [{ field: 'leadScore', operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL, value: '50' }, { leadScore: { gte: 50 } }],
    [{ field: 'leadScore', operand: ViewFilterOperand.LESS_THAN_OR_EQUAL, value: '50' }, { leadScore: { lte: 50 } }],
    [{ field: 'status', operand: ViewFilterOperand.IS, value: '["lead","customer"]' }, { status: { in: ['lead', 'customer'] } }],
    [{ field: 'status', operand: ViewFilterOperand.IS_NOT, value: '["inactive"]' }, { not: { status: { in: ['inactive'] } } }],
    [{ field: 'status', operand: ViewFilterOperand.IS_EMPTY, value: '' }, { status: { is: 'NULL' } }],
    [{ field: 'createdAt', operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01T00:00:00.000Z' }, { createdAt: { gte: '2026-01-01T00:00:00Z' } }],
    [{ field: 'companyId', operand: ViewFilterOperand.IS, value: UUID }, { companyId: { in: [UUID] } }],
  ];
  it.each(cases)('%j', (row, expected) => expect(gql(row)).toEqual(expected));
});
