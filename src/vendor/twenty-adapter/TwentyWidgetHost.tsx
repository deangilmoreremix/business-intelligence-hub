import { ApolloProvider } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useMemo, type ReactNode } from 'react';
import { ThemeProvider } from 'twenty-ui/theme';

import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { IframeWidget } from '@/page-layout/widgets/iframe/components/IframeWidget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetConfigurationType, WidgetType } from '~/generated-metadata/graphql';

import { createDashboardApolloClient } from './apolloLink';
import type { RpcFn } from './chartData';
import { buildCatalog } from './metadata';

if (!i18n.locale) {
  i18n.load('en', {});
  i18n.activate('en');
}

/** One store per dashboard so widgets share metadata but not component state with other dashboards. */
export const createTwentyStore = (widgets: PageLayoutWidget[], layoutId: string) => {
  const store = createStore();
  const { flatObjects, flatFields } = buildCatalog();
  const ready = (current: object[]) => ({ current, draft: [], status: 'up-to-date' as const });
  store.set(metadataStoreState.atomFamily('objectMetadataItems'), ready(flatObjects));
  store.set(metadataStoreState.atomFamily('fieldMetadataItems'), ready(flatFields));
  store.set(metadataStoreState.atomFamily('indexMetadataItems'), ready([]));
  store.set(currentWorkspaceMemberState.atom, {
    id: 'local-user', name: { firstName: 'User', lastName: '' }, colorScheme: 'Light', locale: 'en',
    timeZone: 'system', dateFormat: 'SYSTEM', timeFormat: 'SYSTEM', numberFormat: 'SYSTEM',
    calendarStartDay: 1,
  } as never);
  store.set(pageLayoutPersistedComponentState.atomFamily({ instanceId: layoutId }), {
    id: layoutId, name: 'Dashboard', type: 'DASHBOARD', tabs: [{ id: `${layoutId}-tab`, title: 'Main', position: 0, widgets }],
  } as never);
  return store;
};

type Props = {
  widget: PageLayoutWidget;
  layoutId: string;
  rpc?: RpcFn;
  editing?: boolean;
  dark?: boolean;
  store?: ReturnType<typeof createStore>;
  client?: ReturnType<typeof createDashboardApolloClient>;
  children?: ReactNode;
};

/** Renders a single vendored Twenty widget (graph or iframe) with all the context it needs. */
export const TwentyWidgetHost = ({ widget, layoutId, rpc, editing = false, dark = false, store: external, client: externalClient }: Props) => {
  const store = useMemo(() => external ?? createTwentyStore([widget], layoutId), [external, widget, layoutId]);
  const client = useMemo(() => externalClient ?? createDashboardApolloClient(rpc), [externalClient, rpc]);
  const type = widget.configuration?.configurationType;
  const isGraph = [
    WidgetConfigurationType.BAR_CHART, WidgetConfigurationType.LINE_CHART,
    WidgetConfigurationType.PIE_CHART, WidgetConfigurationType.AGGREGATE_CHART,
  ].includes(type as WidgetConfigurationType);

  return (
    <ThemeProvider colorScheme={dark ? 'dark' : 'light'} applyToRoot={false} className="twenty-theme">
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <ApolloProvider client={client}>
          <ApolloCoreClientContext.Provider value={client}>
            <PageLayoutEditModeProviderContext value={{ isInEditMode: editing }}>
              <PageLayoutComponentInstanceContext.Provider value={{ instanceId: layoutId }}>
                <WidgetComponentInstanceContext.Provider value={{ instanceId: widget.id }}>
                  {isGraph ? <GraphWidget /> : widget.type === WidgetType.IFRAME ? <IframeWidget widget={widget} /> : null}
                </WidgetComponentInstanceContext.Provider>
              </PageLayoutComponentInstanceContext.Provider>
            </PageLayoutEditModeProviderContext>
          </ApolloCoreClientContext.Provider>
        </ApolloProvider>
      </I18nProvider>
    </JotaiProvider>
    </ThemeProvider>
  );
};
