export const tooltipContent = {
  dashboard: {
    title: 'Your central hub for AI-powered business intelligence and analytics',
    search: 'Search across all AI applications by name or description. Try searching for "pipeline" or "analytics"',
    categoryFilter: 'Filter applications by category to quickly find related tools',
    gridView: 'Display applications in a grid layout for better overview',
    listView: 'Display applications in a list layout for detailed information',
    darkMode: 'Toggle between light and dark theme for comfortable viewing'
  },

  kpiCards: {
    activeDeals: 'Total number of deals currently in your pipeline. Click to view detailed pipeline intelligence.',
    pipelineValue: 'Total value of all active deals in your pipeline. Click to analyze revenue opportunities.',
    wonDeals: 'Number of successfully closed deals. Click to view win rate analysis and success factors.',
    avgDealSize: 'Average value per deal in your pipeline. Click to view sales cycle analytics and trends.',
    crmConnected: 'Your CRM is connected and syncing data automatically',
    crmNotConnected: 'Connect your CRM to enable real-time data synchronization and AI-powered insights'
  },

  navigation: {
    dashboard: 'Return to the main dashboard with overview of all AI applications',
    pipeline: 'Access pipeline intelligence with AI-powered deal scoring and predictions',
    activity: 'View activity analytics including communication patterns and engagement metrics',
    tasks: 'Manage smart follow-ups with AI-driven task prioritization',
    reports: 'Generate comprehensive performance reports with actionable insights'
  },

  aiApps: {
    'pipeline-intelligence': 'Get AI-powered insights on your sales pipeline with predictive analytics and automated deal scoring',
    'deal-risk-monitor': 'Identify at-risk deals early with real-time monitoring and smart alerts',
    'conversion-insights': 'Discover conversion opportunities and get AI-driven recommendations to move deals forward',
    'pipeline-health': 'Comprehensive health analysis of your entire sales pipeline with actionable metrics',
    'sales-cycle-analytics': 'Track and optimize your sales cycle length with advanced analytics and benchmarks',
    'win-rate-intelligence': 'Analyze win rates across segments and identify success factors driving conversions',
    'ai-sales-forecast': 'Get accurate sales predictions powered by machine learning algorithms',
    'live-deal-analysis': 'Real-time intelligence on active deals with AI-powered insights and recommendations',
    'competitor-insights': 'Market intelligence and competitive analysis to win more deals',
    'revenue-intelligence': 'Advanced revenue analytics and optimization strategies for growth',
    'activity-analytics': 'Analyze communication patterns and identify optimization opportunities',
    'response-intelligence': 'Track and improve response times across all communication channels',
    'channel-sync-hub': 'Coordinate and synchronize activities across multiple communication channels',
    'email-optimizer': 'Optimize email performance with AI-powered suggestions and timing recommendations',
    'sentiment-monitor': 'Real-time sentiment analysis across all customer communications',
    'comm-performance': 'Measure communication ROI and performance metrics',
    'smart-followups': 'Never miss a follow-up with AI-powered reminders and smart scheduling',
    'priority-intelligence': 'AI-driven task prioritization to focus on high-impact activities',
    'task-impact-analytics': 'Measure the impact of your activities on deal progression and outcomes',
    'workflow-intelligence': 'Identify workflow bottlenecks and optimize team efficiency',
    'risk-monitor': 'Deadline risk assessment with proactive mitigation strategies',
    'smart-allocation': 'Optimize resource allocation with AI-driven recommendations',
    'integration-analytics': 'Cross-platform activity sync and integration health monitoring',
    'apps-performance': 'Monitor and optimize the performance of all integrated applications',
    'data-quality': 'Data completeness scoring and quality improvement recommendations',
    'automation-hub': 'Identify and implement automation opportunities to save time',
    'apps-intelligence': 'Optimize tool usage with intelligence on adoption and effectiveness',
    'system-analytics': 'System activity insights and performance monitoring dashboard',
    'performance-reports': 'Generate comprehensive reports on sales and team performance',
    'pipeline-visualization': 'Visual analytics and charts for pipeline data exploration',
    'revenue-breakdown': 'Detailed revenue analysis broken down by segments and time periods',
    'conversion-analytics': 'Conversion rate metrics and funnel optimization insights',
    'live-kpi-monitor': 'Real-time dashboard of key performance indicators with AI insights',
    'activity-dashboard': 'Comprehensive view of all activity metrics and trends',
    'trend-intelligence': 'Predictive trend analysis with forecasting and pattern recognition'
  },

  buttons: {
    aiAnalysis: 'Run AI-powered analysis on your data to get instant insights and recommendations',
    aiAnalysisWithProvider: 'Choose your AI provider and run advanced analysis. GPT-5 offers deeper reasoning while Gemini provides faster results.',
    crmSync: 'Manually sync data from your connected CRM system',
    crmSyncing: 'Synchronization in progress. Your data is being updated.',
    crmSyncSuccess: 'Data successfully synchronized with your CRM',
    crmSyncError: 'Sync failed. Check your CRM connection and try again.',
    exportData: 'Export current data and insights to CSV or PDF format',
    refreshData: 'Refresh data to get the latest information from your CRM',
    filterData: 'Apply filters to focus on specific data segments',
    settingsOpen: 'Open settings to configure integrations and preferences'
  },

  features: {
    aiProviderGPT5: 'GPT-5 - Advanced reasoning and deep analysis with premium AI capabilities',
    aiProviderGemini: 'Gemini - Fast processing and instant insights with optimized performance',
    darkModeEnabled: 'Dark mode is currently enabled. Click to switch to light mode.',
    darkModeDisabled: 'Light mode is currently enabled. Click to switch to dark mode.',
    searchActive: 'Currently searching across all applications',
    filtersApplied: 'Filters are currently applied. Clear to see all applications.',
    noResults: 'No applications match your current search or filters. Try adjusting your criteria.',
    dataLoading: 'Loading data from your CRM. This may take a moment.',
    noDataAvailable: 'No data available. Connect your CRM to see insights.',
    avatarStack: 'Key contacts associated with these deals. Click to view details.'
  },

  accessibility: {
    keyboardNavigation: 'Use Tab to navigate, Enter to select, Escape to close',
    screenReaderSupport: 'This application supports screen readers for enhanced accessibility',
    tooltipClose: 'Press Escape to close this tooltip',
    focusMode: 'Enable focus mode to reduce visual distractions'
  },

  onboarding: {
    welcome: 'Welcome to your Business Intelligence Hub! Start by connecting your CRM for AI-powered insights.',
    firstAnalysis: 'Try running your first AI analysis to discover insights in your data',
    exploreApps: 'Explore 35+ AI applications designed to optimize your business operations',
    customizeView: 'Customize your view with filters, search, and layout options',
    needHelp: 'Hover over any element to learn more about its functionality'
  },

  errors: {
    crmNotConnected: 'CRM not connected. Connect your CRM to enable this feature.',
    insufficientData: 'Not enough data available for analysis. Sync your CRM to get started.',
    analysisError: 'Analysis failed. Please try again or contact support if the issue persists.',
    networkError: 'Network error. Check your connection and try again.',
    permissionDenied: 'You don\'t have permission to access this feature.'
  }
};

export type TooltipContentType = typeof tooltipContent;
