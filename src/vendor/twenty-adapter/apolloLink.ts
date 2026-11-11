import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { Observable } from 'rxjs';
import { resolveCompleteFileUpload, resolveCreateFileUpload, type StorageLike } from './fileUpload';
import {
  defaultRpc,
  resolveAggregateQuery,
  resolveBarChart,
  resolveLineChart,
  resolvePieChart,
  type RpcFn,
} from './chartData';

type Selection = { kind: string; name?: { value: string } };

/**
 * ApolloLink that answers the GraphQL operations Twenty's widgets issue (BarChartData, LineChartData,
 * PieChartData, Aggregate<Plural>) directly from Supabase. Anything else is rejected, so a widget that needs
 * Twenty's backend fails loudly instead of silently showing nothing.
 */
export const createSupabaseChartLink = (rpc: RpcFn = defaultRpc, storage?: StorageLike) =>
  new ApolloLink(operation => {
    const def = operation.query.definitions.find(d => d.kind === 'OperationDefinition') as
      | { name?: { value: string }; selectionSet: { selections: Selection[] } }
      | undefined;
    const opName = def?.name?.value ?? '';
    const vars = operation.variables as Record<string, any>;

    const run = async (): Promise<Record<string, unknown>> => {
      if (opName === 'BarChartData') {
        return { barChartData: await resolveBarChart(rpc, vars.input.objectMetadataId, vars.input.configuration) };
      }
      if (opName === 'LineChartData') {
        return { lineChartData: await resolveLineChart(rpc, vars.input.objectMetadataId, vars.input.configuration) };
      }
      if (opName === 'PieChartData') {
        return { pieChartData: await resolvePieChart(rpc, vars.input.objectMetadataId, vars.input.configuration) };
      }
      if (opName.startsWith('Aggregate')) {
        const root = def?.selectionSet.selections.find(s => s.kind === 'Field') as
          | (Selection & { selectionSet?: { selections: Selection[] } })
          | undefined;
        const plural = root?.name?.value ?? '';
        const selected = (root?.selectionSet?.selections ?? []).map(s => s.name?.value ?? '').filter(Boolean);
        return { [plural]: await resolveAggregateQuery(rpc, plural, selected, vars.filter) };
      }
      if (opName === 'CreateFileUpload') return { createFileUpload: await resolveCreateFileUpload(vars as { filename: string; size: number }, storage) };
      if (opName === 'CompleteFileUpload') return { completeFileUpload: await resolveCompleteFileUpload(vars as { fileId: string }, storage) };
      throw new Error(`Operation "${opName}" is not available in this app`);
    };

    return new Observable(observer => {
      run().then(
        data => { observer.next({ data }); observer.complete(); },
        err => observer.error(err),
      );
    });
  });

export const createDashboardApolloClient = (rpc?: RpcFn, storage?: StorageLike) =>
  new ApolloClient({
    link: createSupabaseChartLink(rpc, storage),
    cache: new InMemoryCache(),
    defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
  });
