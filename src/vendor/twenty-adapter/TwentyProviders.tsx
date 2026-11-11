import { ApolloProvider } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useMemo, type ReactNode } from 'react';
import { ThemeProvider } from 'twenty-ui/theme';
import { createDashboardApolloClient } from './apolloLink';
import '../twenty-adapter/twenty-theme';

if (!i18n.locale) { i18n.load('en', {}); i18n.activate('en'); }

/** Minimal providers needed by vendored Twenty components that aren't widgets (e.g. the image upload input). */
export const TwentyProviders = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => {
  const client = useMemo(() => createDashboardApolloClient(), []);
  return (
    <ThemeProvider colorScheme={dark ? 'dark' : 'light'} applyToRoot={false} className="twenty-theme">
      <I18nProvider i18n={i18n}>
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};
