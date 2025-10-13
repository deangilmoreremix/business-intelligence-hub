import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { ContentProvider } from '../contexts/ContentContext';
import '../index.css';

export const AnalyticsWidget: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NavigationProvider>
          <ContentProvider>
            <App />
          </ContentProvider>
        </NavigationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default AnalyticsWidget;
