import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ContentProvider } from './contexts/ContentContext';
import { WalkthroughProvider } from './contexts/WalkthroughContext';
import { initializeKnowledgeBase } from './utils/initializeKnowledge';

const AnalyticsApp: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const isStandalone = window.self === window.top;

    console.log(
      '🚀 Analytics App initialized',
      isStandalone ? '(Standalone Mode)' : '(Module Federation Mode)'
    );

    initializeKnowledgeBase()
      .then(() => {
        console.log('✅ Knowledge base initialized');
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error('❌ Failed to initialize knowledge base:', error);
        setIsInitialized(true);
      });

    if (!isStandalone) {
      window.parent.postMessage(
        {
          type: 'ANALYTICS_READY',
          source: 'AnalyticsApp',
          data: {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            capabilities: ['dashboard', 'analytics', 'reports', 'chatbot'],
          },
        },
        '*'
      );
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Analytics Hub...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default AnalyticsApp;
