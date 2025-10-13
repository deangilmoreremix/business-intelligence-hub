import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ContentProvider } from './contexts/ContentContext';
import { WalkthroughProvider } from './contexts/WalkthroughContext';

const isStandalone = () => {
  return window.self === window.top;
};

console.log('🚀 Analytics App bootstrap', isStandalone() ? '(Standalone Mode)' : '(Federated Mode)');

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <WalkthroughProvider>
            <NavigationProvider>
              <ContentProvider>
                <App />
              </ContentProvider>
            </NavigationProvider>
          </WalkthroughProvider>
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
