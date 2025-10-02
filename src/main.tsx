import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { ContentProvider } from './contexts/ContentContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <NavigationProvider>
          <ContentProvider>
            <App />
          </ContentProvider>
        </NavigationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
