// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { ViewFilterOperand } from 'twenty-shared/types';
import { contextFilterRow, defaultWidget, effectiveFilterRows, gqlFilterFor, toTwentyWidget, type ContextRecord } from './model';
import { parseDrilldownFilters } from './RecordsPage';
import { getFieldId, getObjectId } from '../../vendor/twenty-adapter/metadata';

const UUID = '3f2b1c4e-8a77-4c3e-9d11-5b0e6a2c9f10';

describe('widget model -> Twenty widget configuration', () => {
  it('bar chart carries the typename/type the vendored widget asserts on, plus ids of catalog fields', () => {
    const w = defaultWidget('bar', 'deal');
    w.options = { ...w.options, operation: 'SUM', aggregateField: 'value', groupBy: 'stageId', groupBy2: 'assignedTo', layout: 'HORIZONTAL', groupMode: 'GROUPED' };
    const t = toTwentyWidget(w) as any;
    expect(t.type).toBe('GRAPH');
    expect(t.objectMetadataId).toBe(getObjectId('deal'));
    expect(t.configuration).toMatchObject({
      __typename: 'BarChartConfiguration', configurationType: 'BAR_CHART', aggregateOperation: 'SUM',
      aggregateFieldMetadataId: getFieldId('deal', 'value'), primaryAxisGroupByFieldMetadataId: getFieldId('deal', 'stageId'),
      secondaryAxisGroupByFieldMetadataId: getFieldId('deal', 'assignedTo'), layout: 'HORIZONTAL', groupMode: 'GROUPED',
    });
    expect(t.gridPosition).toMatchObject({ columnSpan: w.grid.w, rowSpan: w.grid.h });
  });

  it('count metric ignores the field and uses the id field', () => {
    const w = defaultWidget('pie', 'contact');
    w.options.aggregateField = 'leadScore';
    expect((toTwentyWidget(w) as any).configuration.aggregateFieldMetadataId).toBe(getFieldId('contact', 'id'));
  });

  it.each([['line', 'LineChartConfiguration'], ['pie', 'PieChartConfiguration'], ['aggregate', 'AggregateChartConfiguration'], ['iframe', 'IframeConfiguration']] as const)('%s -> %s', (kind, typename) => {
    expect((toTwentyWidget(defaultWidget(kind, 'contact')) as any).configuration.__typename).toBe(typename);
  });
});

describe('record context (widget-level record filter)', () => {
  const contact: ContextRecord = { object: 'contact', id: UUID, label: 'Ann' };
  const company: ContextRecord = { object: 'company', id: UUID, label: 'Acme' };

  it('maps a selected record onto related objects', () => {
    expect(contextFilterRow('contact', contact)).toMatchObject({ field: 'id' });
    expect(contextFilterRow('deal', contact)).toMatchObject({ field: 'contactId' });
    expect(contextFilterRow('contact', company)).toMatchObject({ field: 'companyId' });
    expect(contextFilterRow('company', contact)).toBeNull();
    expect(contextFilterRow('deal', null)).toBeNull();
  });

  it('only applies when the widget opts in, and reaches the RPC filter', () => {
    const w = defaultWidget('aggregate', 'deal');
    expect(effectiveFilterRows(w, contact)).toHaveLength(0);
    w.options.useContext = true;
    expect(effectiveFilterRows(w, contact)).toEqual([{ field: 'contactId', operand: ViewFilterOperand.IS, value: UUID }]);
    expect(gqlFilterFor(w, contact)).toEqual({ contactId: { in: [UUID] } });
  });

  it('drops filters on fields that no longer exist for the object', () => {
    const w = defaultWidget('pie', 'contact');
    w.options.filters = [{ field: 'nope', operand: ViewFilterOperand.IS, value: 'x' }];
    expect(effectiveFilterRows(w, null)).toEqual([]);
  });
});

describe('drill-down URL parsing (Twenty filter[field][op]=value)', () => {
  it('parses select, text and number filters', () => {
    const { rows } = parseDrilldownFilters('?filter[status][is]=["lead"]&filter[company][contains]=Acme&filter[leadScore][greaterThan]=50');
    expect(rows).toEqual([
      { field: 'status', operand: ViewFilterOperand.IS, value: '["lead"]' },
      { field: 'company', operand: ViewFilterOperand.CONTAINS, value: 'Acme' },
      { field: 'leadScore', operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL, value: '50' },
    ]);
  });
  it('flags grouped filters it cannot show and ignores unknown operands', () => {
    const r = parseDrilldownFilters('?filterGroup[operator]=AND&filter[status][weird]=x');
    expect(r.unsupported).toBe(true);
    expect(r.rows).toEqual([]);
  });
});
