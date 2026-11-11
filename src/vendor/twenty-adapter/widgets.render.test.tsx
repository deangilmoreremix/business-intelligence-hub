// @vitest-environment jsdom
import './testSetup';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TwentyWidgetHost } from './TwentyWidgetHost';
import { getFieldId, getObjectId } from './metadata';
import type { RpcFn } from './chartData';

afterEach(cleanup);

const rpc: RpcFn = async args => {
  if (args.p_group1 === 'status') return [{ g1: 'lead', g2: null, v: 4 }, { g1: 'customer', g2: null, v: 7 }];
  return [{ g1: null, g2: null, v: 11 }];
};

const base = (id: string, configuration: Record<string, unknown>) => ({
  id, pageLayoutTabId: 't', title: id, type: 'GRAPH', objectMetadataId: getObjectId('contact'),
  gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 6 }, configuration,
}) as never;

describe('vendored Twenty widgets render from Supabase-shaped data', () => {
  it('bar chart', async () => {
    const widget = base('w-bar', {
      __typename: 'BarChartConfiguration', configurationType: 'BAR_CHART', aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT',
      primaryAxisGroupByFieldMetadataId: getFieldId('contact', 'status'), layout: 'VERTICAL', displayLegend: true,
    });
    const { container } = render(<MemoryRouter><TwentyWidgetHost widget={widget} layoutId="L1" rpc={rpc} /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull(), { timeout: 20000 });
  }, 60000);

  it('aggregate chart shows the number', async () => {
    const widget = base('w-agg', {
      __typename: 'AggregateChartConfiguration', configurationType: 'AGGREGATE_CHART', aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT',
    });
    render(<MemoryRouter><TwentyWidgetHost widget={widget} layoutId="L2" rpc={rpc} /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('11')).toBeTruthy(), { timeout: 20000 });
  }, 60000);

  it('line chart', async () => {
    const widget = base('w-line', {
      __typename: 'LineChartConfiguration', configurationType: 'LINE_CHART', aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT',
      primaryAxisGroupByFieldMetadataId: getFieldId('contact', 'createdAt'), primaryAxisDateGranularity: 'MONTH',
    });
    const lineRpc: RpcFn = async () => [{ g1: '2026-01-01', g2: null, v: 3 }, { g1: '2026-02-01', g2: null, v: 5 }];
    const { container } = render(<MemoryRouter><TwentyWidgetHost widget={widget} layoutId="L3" rpc={lineRpc} /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull(), { timeout: 20000 });
  }, 60000);

  it('pie chart', async () => {
    const widget = base('w-pie', {
      __typename: 'PieChartConfiguration', configurationType: 'PIE_CHART', aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT',
      groupByFieldMetadataId: getFieldId('contact', 'status'),
    });
    const { container } = render(<MemoryRouter><TwentyWidgetHost widget={widget} layoutId="L4" rpc={rpc} /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull(), { timeout: 20000 });
  }, 60000);

  it('iframe widget renders its URL', async () => {
    const widget = {
      id: 'w-if', pageLayoutTabId: 't', title: 'Docs', type: 'IFRAME', objectMetadataId: null,
      gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 6 },
      configuration: { __typename: 'IframeConfiguration', configurationType: 'IFRAME', url: 'https://example.com/report' },
    } as never;
    const { container } = render(<MemoryRouter><TwentyWidgetHost widget={widget} layoutId="L5" rpc={rpc} /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull(), { timeout: 20000 });
    expect(container.querySelector('iframe')!.getAttribute('src')).toContain('example.com/report');
  }, 60000);
});
