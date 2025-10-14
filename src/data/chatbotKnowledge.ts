import { aiApps } from './aiApps';

export interface KnowledgeEntry {
  category: string;
  key: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export const generateKnowledgeBase = (): KnowledgeEntry[] => {
  const knowledge: KnowledgeEntry[] = [];

  knowledge.push({
    category: 'overview',
    key: 'app-overview',
    title: 'Business Intelligence Hub Overview',
    content: `The Business Intelligence Hub is a comprehensive AI-driven analytics platform with 35 specialized applications designed for modern businesses. It provides real-time dashboards, predictive analytics, and advanced visualizations across five major categories: Pipeline Analytics (10 apps), Communication Analytics (6 apps), Task Analytics (6 apps), Integration Analytics (6 apps), and Analytics Dashboard (7 apps). The platform uses AI to provide actionable insights, optimize workflows, and drive business growth.`,
    metadata: { importance: 'high', type: 'general' }
  });

  knowledge.push({
    category: 'navigation',
    key: 'how-to-navigate',
    title: 'How to Navigate the Platform',
    content: `The main dashboard displays all 35 applications in a grid or list view. You can search for applications using the search bar, filter by category using the dropdown, and toggle between grid and list views. Click on any application card to open that specific tool. The navigation bar at the top provides quick access to different sections. You can also use the dark mode toggle to switch between light and dark themes.`,
    metadata: { importance: 'high', type: 'navigation' }
  });

  knowledge.push({
    category: 'features',
    key: 'dashboard-features',
    title: 'Dashboard Features',
    content: `The dashboard includes: (1) Search functionality to find apps quickly, (2) Category filters to show only specific types of apps, (3) Grid/List view toggle for different viewing preferences, (4) KPI Cards showing key metrics, (5) AI Analytics Overview with real-time insights, (6) Dark/Light mode toggle, (7) Help Center with guided tours, (8) Floating help button for quick assistance. All preferences are automatically saved and sync across sessions.`,
    metadata: { importance: 'high', type: 'features' }
  });

  knowledge.push({
    category: 'features',
    key: 'walkthrough-system',
    title: 'Guided Tours and Walkthroughs',
    content: `The platform includes an interactive walkthrough system to help users learn features. Access it via the floating help button or Help Center. Tours are organized by category (Getting Started, Features, Applications, Advanced) and track your progress. You can start, pause, or restart any tour at any time. First-time users automatically see the dashboard onboarding tour.`,
    metadata: { importance: 'medium', type: 'features' }
  });

  knowledge.push({
    category: 'features',
    key: 'ai-analysis',
    title: 'AI-Powered Analysis',
    content: `Many applications include AI analysis capabilities powered by OpenAI GPT-4 or Google Gemini. These features provide predictive insights, identify trends, suggest optimizations, and offer actionable recommendations. AI analysis considers your CRM data, pipeline health, communication patterns, and business context to generate personalized insights.`,
    metadata: { importance: 'high', type: 'features' }
  });

  aiApps.forEach(app => {
    knowledge.push({
      category: 'applications',
      key: `app-${app.id}`,
      title: app.title,
      content: `${app.title}: ${app.description} This application is part of the ${app.category} category. Access it from the dashboard by searching for "${app.title}" or filtering by ${app.category} category. The app provides specialized analytics and insights to help optimize your ${app.category.toLowerCase()} operations.`,
      metadata: {
        appId: app.id,
        category: app.category,
        path: app.path,
        importance: 'medium'
      }
    });
  });

  const categoryDescriptions = {
    'Pipeline': 'Pipeline Analytics applications help you manage and optimize your sales pipeline. Track deal progress, identify risks, forecast revenue, analyze win rates, and get AI-powered insights on deal health and conversion opportunities.',
    'Communication': 'Communication Analytics applications analyze your interaction patterns across all channels. Monitor response times, track sentiment, optimize email effectiveness, and identify the best communication strategies to engage prospects and customers.',
    'Tasks': 'Task Analytics applications help you optimize workflow efficiency and resource allocation. Prioritize activities based on impact, get smart follow-up reminders, identify bottlenecks, and ensure your team focuses on high-value tasks.',
    'Integration': 'Integration Analytics applications monitor your connected tools and data quality. Track integration performance, identify automation opportunities, ensure data completeness, and optimize your tech stack for maximum efficiency.',
    'Analytics': 'Analytics Dashboard applications provide comprehensive reporting and visualization capabilities. Access performance reports, visualize pipeline trends, analyze conversion rates, monitor KPIs in real-time, and get predictive insights on business trends.'
  };

  Object.entries(categoryDescriptions).forEach(([category, description]) => {
    knowledge.push({
      category: 'categories',
      key: `category-${category.toLowerCase()}`,
      title: `${category} Category`,
      content: description,
      metadata: { category, importance: 'medium' }
    });
  });

  knowledge.push({
    category: 'troubleshooting',
    key: 'common-issues',
    title: 'Common Issues and Solutions',
    content: `Common issues: (1) If apps aren't loading, check your internet connection and refresh the page. (2) If data isn't saving, ensure you're using a supported browser (Chrome, Firefox, Safari, Edge). (3) For performance issues, try clearing your browser cache. (4) If dark mode looks incorrect, toggle it off and on again. (5) For AI analysis features, ensure API keys are configured correctly in the environment.`,
    metadata: { importance: 'medium', type: 'troubleshooting' }
  });

  knowledge.push({
    category: 'data',
    key: 'data-persistence',
    title: 'Data Persistence and Sync',
    content: `All your preferences, favorites, and settings are automatically saved to Supabase and sync across browser sessions and devices. The platform uses real-time subscriptions to keep data updated. Your data is secured with Row Level Security (RLS) and is only accessible to you. Changes are saved instantly as you interact with the platform.`,
    metadata: { importance: 'medium', type: 'data' }
  });

  knowledge.push({
    category: 'usage',
    key: 'best-practices',
    title: 'Best Practices for Using the Platform',
    content: `Best practices: (1) Start with the guided tours in the Help Center to learn key features. (2) Use the search function to quickly find specific apps. (3) Star your most-used apps as favorites for quick access. (4) Regularly check the AI Analytics Dashboard for insights. (5) Enable dark mode for reduced eye strain during extended use. (6) Review the KPI cards on the main dashboard to monitor key metrics. (7) Explore apps in categories relevant to your role (sales reps focus on Pipeline, managers on Analytics).`,
    metadata: { importance: 'medium', type: 'usage' }
  });

  knowledge.push({
    category: 'features',
    key: 'kpi-monitoring',
    title: 'KPI Cards and Metrics',
    content: `The dashboard displays key performance indicator (KPI) cards showing critical business metrics like total pipeline value, active deals, conversion rates, and response times. These cards update in real-time and provide at-a-glance insights into business performance. Click on any metric to drill down for more details.`,
    metadata: { importance: 'medium', type: 'features' }
  });

  return knowledge;
};

export const getKnowledgeByCategory = (category: string): KnowledgeEntry[] => {
  return generateKnowledgeBase().filter(k => k.category === category);
};

export const searchKnowledge = (query: string): KnowledgeEntry[] => {
  const knowledge = generateKnowledgeBase();
  const lowerQuery = query.toLowerCase();

  return knowledge.filter(k =>
    k.title.toLowerCase().includes(lowerQuery) ||
    k.content.toLowerCase().includes(lowerQuery) ||
    k.key.toLowerCase().includes(lowerQuery)
  );
};

export const getAllKnowledge = (): KnowledgeEntry[] => {
  return generateKnowledgeBase();
};
