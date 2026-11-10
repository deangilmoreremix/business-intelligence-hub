import { Walkthrough } from '../types/walkthrough';

export const walkthroughs: Record<string, Walkthrough> = {
  'dashboard-onboarding': {
    id: 'dashboard-onboarding',
    title: 'Welcome to Business Intelligence Hub',
    description: 'Learn the basics of navigating your dashboard and accessing AI-powered insights',
    category: 'onboarding',
    autoStart: true,
    showOnce: true,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Your Intelligence Hub',
        description: 'This is your central command center for AI-powered business intelligence. You have access to 35+ specialized AI applications designed to optimize every aspect of your business operations.',
        position: 'center'
      },
      {
        id: 'kpi-cards',
        title: 'Key Performance Indicators',
        description: 'These cards show your most important metrics at a glance. Click any card to dive deeper into that specific area of your business.',
        targetElement: '[data-tour="kpi-cards"]',
        position: 'bottom'
      },
      {
        id: 'search',
        title: 'Search Applications',
        description: 'Use the search bar to quickly find specific AI applications by name or description. Try searching for "pipeline" or "analytics".',
        targetElement: '[data-tour="search-input"]',
        position: 'bottom'
      },
      {
        id: 'category-filter',
        title: 'Filter by Category',
        description: 'Filter applications by category to quickly find related tools. Categories include Pipeline, Communication, Tasks, Integration, and Analytics.',
        targetElement: '[data-tour="category-filter"]',
        position: 'bottom'
      },
      {
        id: 'view-mode',
        title: 'Switch View Modes',
        description: 'Toggle between grid and list views based on your preference. Grid view provides a quick overview, while list view shows more details.',
        targetElement: '[data-tour="view-toggle"]',
        position: 'bottom'
      },
      {
        id: 'app-cards',
        title: 'AI Applications',
        description: 'Each card represents a powerful AI application. Hover over any card to see a detailed description, then click to open the full application.',
        targetElement: '[data-tour="app-card-first"]',
        position: 'top'
      },
      {
        id: 'dark-mode',
        title: 'Theme Toggle',
        description: 'Switch between light and dark themes for comfortable viewing in any environment.',
        targetElement: '[data-tour="dark-mode-toggle"]',
        position: 'left'
      },
      {
        id: 'complete',
        title: 'You\'re All Set!',
        description: 'You now know the basics of navigating your Business Intelligence Hub. Click on any application to explore its features. You can replay this tour anytime from the help menu.',
        position: 'center'
      }
    ]
  },

  'pipeline-intelligence-tour': {
    id: 'pipeline-intelligence-tour',
    title: 'Pipeline Intelligence Guide',
    description: 'Learn how to analyze your sales pipeline with AI-powered insights',
    category: 'app',
    steps: [
      {
        id: 'overview',
        title: 'Pipeline Intelligence',
        description: 'This application provides comprehensive AI-powered analytics for your sales pipeline, including predictive insights and automated deal scoring.',
        position: 'center'
      },
      {
        id: 'ai-analysis',
        title: 'AI-Powered Analysis',
        description: 'Click this button to run AI analysis on your pipeline data. You can choose GPT-6 Astra for deep reasoning or GPT-6.1 Terra for fast results.',
        targetElement: '[data-tour="ai-analysis-button"]',
        position: 'bottom'
      },
      {
        id: 'metrics',
        title: 'Key Metrics',
        description: 'These cards display your most important pipeline metrics with trend indicators. Watch how they change over time to spot patterns.',
        targetElement: '[data-tour="metrics-section"]',
        position: 'bottom'
      },
      {
        id: 'insights',
        title: 'AI-Generated Insights',
        description: 'This panel displays AI-generated insights based on your pipeline data. Click "Generate AI Insights" to see personalized recommendations.',
        targetElement: '[data-tour="insights-panel"]',
        position: 'right'
      },
      {
        id: 'risk-analysis',
        title: 'Risk Analysis',
        description: 'The risk analysis panel identifies potential issues in your pipeline, helping you take proactive action to prevent deal loss.',
        targetElement: '[data-tour="risk-panel"]',
        position: 'left'
      },
      {
        id: 'stage-analysis',
        title: 'Pipeline Stages',
        description: 'View deal distribution and conversion rates across all pipeline stages. Use this to identify bottlenecks and optimization opportunities.',
        targetElement: '[data-tour="stage-analysis"]',
        position: 'top'
      }
    ]
  },

  'ai-analysis-feature': {
    id: 'ai-analysis-feature',
    title: 'Using AI Analysis',
    description: 'Master the AI analysis features available in all applications',
    category: 'feature',
    steps: [
      {
        id: 'intro',
        title: 'AI Analysis Feature',
        description: 'Most applications include AI analysis capabilities. This tour will show you how to get the most out of these powerful features.',
        position: 'center'
      },
      {
        id: 'provider-selection',
        title: 'Choose Your AI Provider',
        description: 'Select between different AI models. GPT-6 Astra offers advanced reasoning for complex analysis, while GPT-6.1 Terra provides faster results for quick insights.',
        targetElement: '[data-tour="ai-provider"]',
        position: 'bottom'
      },
      {
        id: 'run-analysis',
        title: 'Run Analysis',
        description: 'Click the analysis button to process your data. The AI will examine patterns, identify insights, and provide actionable recommendations.',
        targetElement: '[data-tour="run-analysis"]',
        position: 'bottom'
      },
      {
        id: 'view-results',
        title: 'Understanding Results',
        description: 'AI insights appear here with specific recommendations. Each insight is based on real patterns in your data and includes suggested actions.',
        targetElement: '[data-tour="analysis-results"]',
        position: 'top'
      }
    ]
  },

  'crm-integration': {
    id: 'crm-integration',
    title: 'CRM Integration Setup',
    description: 'Connect your CRM to unlock the full power of AI-driven insights',
    category: 'feature',
    steps: [
      {
        id: 'intro',
        title: 'Connect Your CRM',
        description: 'Connecting your CRM enables real-time data synchronization and unlocks all AI-powered features. Let\'s set it up!',
        position: 'center'
      },
      {
        id: 'connection-status',
        title: 'Connection Status',
        description: 'This indicator shows your current CRM connection status. Green means connected and syncing, red means not connected.',
        targetElement: '[data-tour="crm-status"]',
        position: 'bottom'
      },
      {
        id: 'setup-button',
        title: 'Setup Connection',
        description: 'Click here to open the CRM setup dialog where you can enter your credentials and configure synchronization settings.',
        targetElement: '[data-tour="crm-setup"]',
        position: 'bottom'
      },
      {
        id: 'sync-button',
        title: 'Manual Sync',
        description: 'Once connected, use this button to manually trigger data synchronization. Data also syncs automatically at regular intervals.',
        targetElement: '[data-tour="crm-sync"]',
        position: 'bottom'
      }
    ]
  },

  'advanced-features': {
    id: 'advanced-features',
    title: 'Advanced Features Tour',
    description: 'Explore advanced features like data export, filtering, and customization',
    category: 'advanced',
    requiredTours: ['dashboard-onboarding'],
    steps: [
      {
        id: 'intro',
        title: 'Advanced Features',
        description: 'You\'ve mastered the basics! Now let\'s explore advanced features that will help you get even more value from the platform.',
        position: 'center'
      },
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'Press "?" at any time to view all available keyboard shortcuts. Use Tab to navigate, Enter to select, and Escape to close dialogs.',
        position: 'center'
      },
      {
        id: 'data-export',
        title: 'Export Data',
        description: 'Many applications support data export. Look for export buttons to download reports in PDF or CSV format.',
        targetElement: '[data-tour="export-button"]',
        position: 'bottom'
      },
      {
        id: 'help-menu',
        title: 'Access Help Anytime',
        description: 'Click the help button to access all tours, search for help topics, view keyboard shortcuts, or contact support.',
        targetElement: '[data-tour="help-button"]',
        position: 'left'
      }
    ]
  }
};

export const getWalkthrough = (id: string): Walkthrough | undefined => {
  return walkthroughs[id];
};

export const getAllWalkthroughs = (): Walkthrough[] => {
  return Object.values(walkthroughs);
};

export const getWalkthroughsByCategory = (category: Walkthrough['category']): Walkthrough[] => {
  return Object.values(walkthroughs).filter(w => w.category === category);
};
