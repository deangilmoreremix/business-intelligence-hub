import { 
  BarChart3, TrendingUp, AlertTriangle, Target, Clock, Award, 
  Zap, Brain, Users, DollarSign, MessageSquare, Clock3,
  Shuffle, Mail, Heart, TrendingDown, CheckSquare, Layers,
  Calendar, Activity, Gauge, PieChart, LineChart, 
  Settings, Database, Workflow, Shield, Eye, FileText
} from 'lucide-react';

export interface AIApp {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  path: string;
}

export const aiApps: AIApp[] = [
  // Deal Pipeline Analytics (10 apps)
  {
    id: 'pipeline-intelligence',
    title: 'Pipeline Intelligence',
    description: 'AI-powered pipeline analytics with predictive insights and automated deal scoring.',
    icon: BarChart3,
    category: 'Pipeline',
    path: '/app/pipeline-intelligence'
  },
  {
    id: 'deal-risk-monitor',
    title: 'Deal Risk Monitor',
    description: 'Real-time risk assessment and alerts for deals in your pipeline.',
    icon: AlertTriangle,
    category: 'Pipeline',
    path: '/app/deal-risk-monitor'
  },
  {
    id: 'conversion-insights',
    title: 'Smart Conversion Insights',
    description: 'Identify conversion opportunities with AI-driven recommendations.',
    icon: Target,
    category: 'Pipeline',
    path: '/app/conversion-insights'
  },
  {
    id: 'pipeline-health',
    title: 'Pipeline Health Dashboard',
    description: 'Comprehensive health analysis of your sales pipeline.',
    icon: TrendingUp,
    category: 'Pipeline',
    path: '/app/pipeline-health'
  },
  {
    id: 'sales-cycle-analytics',
    title: 'Sales Cycle Analytics',
    description: 'Track and optimize your sales cycle with advanced analytics.',
    icon: Clock,
    category: 'Pipeline',
    path: '/app/sales-cycle-analytics'
  },
  {
    id: 'win-rate-intelligence',
    title: 'Win Rate Intelligence',
    description: 'Analyze win rates and identify factors that drive success.',
    icon: Award,
    category: 'Pipeline',
    path: '/app/win-rate-intelligence'
  },
  {
    id: 'ai-sales-forecast',
    title: 'AI Sales Forecast',
    description: 'Predictive sales forecasting powered by machine learning.',
    icon: Zap,
    category: 'Pipeline',
    path: '/app/ai-sales-forecast'
  },
  {
    id: 'live-deal-analysis',
    title: 'Live Deal Analysis',
    description: 'Real-time deal intelligence with AI-powered insights.',
    icon: Brain,
    category: 'Pipeline',
    path: '/app/live-deal-analysis'
  },
  {
    id: 'competitor-insights',
    title: 'Competitor Insights',
    description: 'Market intelligence and competitive analysis dashboard.',
    icon: Users,
    category: 'Pipeline',
    path: '/app/competitor-insights'
  },
  {
    id: 'revenue-intelligence',
    title: 'Revenue Intelligence',
    description: 'Advanced revenue analytics and optimization insights.',
    icon: DollarSign,
    category: 'Pipeline',
    path: '/app/revenue-intelligence'
  },
  
  // Communication Analytics (6 apps)
  {
    id: 'activity-analytics',
    title: 'Activity Analytics',
    description: 'Analyze communication frequency patterns and optimization opportunities.',
    icon: MessageSquare,
    category: 'Communication',
    path: '/app/activity-analytics'
  },
  {
    id: 'response-intelligence',
    title: 'Response Intelligence',
    description: 'Track and optimize response times across all communication channels.',
    icon: Clock3,
    category: 'Communication',
    path: '/app/response-intelligence'
  },
  {
    id: 'channel-sync-hub',
    title: 'Channel Sync Hub',
    description: 'Multi-channel coordination and synchronization dashboard.',
    icon: Shuffle,
    category: 'Communication',
    path: '/app/channel-sync-hub'
  },
  {
    id: 'email-optimizer',
    title: 'Smart Email Optimizer',
    description: 'AI-powered email response optimization and insights.',
    icon: Mail,
    category: 'Communication',
    path: '/app/email-optimizer'
  },
  {
    id: 'sentiment-monitor',
    title: 'Sentiment Monitor',
    description: 'Real-time sentiment analysis across all communications.',
    icon: Heart,
    category: 'Communication',
    path: '/app/sentiment-monitor'
  },
  {
    id: 'comm-performance',
    title: 'Comm Performance',
    description: 'Communication ROI and performance analytics dashboard.',
    icon: TrendingDown,
    category: 'Communication',
    path: '/app/comm-performance'
  },

  // Task Analytics (6 apps)
  {
    id: 'smart-followups',
    title: 'Smart Follow-ups',
    description: 'AI-powered follow-up reminders and optimization.',
    icon: CheckSquare,
    category: 'Tasks',
    path: '/app/smart-followups'
  },
  {
    id: 'priority-intelligence',
    title: 'Priority Intelligence',
    description: 'Task priority optimization using AI algorithms.',
    icon: Layers,
    category: 'Tasks',
    path: '/app/priority-intelligence'
  },
  {
    id: 'task-impact-analytics',
    title: 'Task Impact Analytics',
    description: 'Measure and analyze the impact of your activities.',
    icon: Activity,
    category: 'Tasks',
    path: '/app/task-impact-analytics'
  },
  {
    id: 'workflow-intelligence',
    title: 'Workflow Intelligence',
    description: 'Detect bottlenecks and optimize workflow efficiency.',
    icon: Workflow,
    category: 'Tasks',
    path: '/app/workflow-intelligence'
  },
  {
    id: 'risk-monitor',
    title: 'Risk Monitor',
    description: 'Deadline risk assessment and mitigation strategies.',
    icon: Shield,
    category: 'Tasks',
    path: '/app/risk-monitor'
  },
  {
    id: 'smart-allocation',
    title: 'Smart Allocation',
    description: 'AI-driven resource allocation and optimization.',
    icon: Calendar,
    category: 'Tasks',
    path: '/app/smart-allocation'
  },

  // Apps/Integration Analytics (6 apps)
  {
    id: 'integration-analytics',
    title: 'Integration Analytics',
    description: 'Cross-platform activity sync and integration insights.',
    icon: Settings,
    category: 'Integration',
    path: '/app/integration-analytics'
  },
  {
    id: 'apps-performance',
    title: 'Apps Performance Monitor',
    description: 'Monitor and optimize app integration performance.',
    icon: Eye,
    category: 'Integration',
    path: '/app/apps-performance'
  },
  {
    id: 'data-quality',
    title: 'Data Quality Dashboard',
    description: 'Data completeness scoring and quality analysis.',
    icon: Database,
    category: 'Integration',
    path: '/app/data-quality'
  },
  {
    id: 'automation-hub',
    title: 'Smart Automation Hub',
    description: 'Identify and implement automation opportunities.',
    icon: Zap,
    category: 'Integration',
    path: '/app/automation-hub'
  },
  {
    id: 'apps-intelligence',
    title: 'Apps Intelligence',
    description: 'Tool usage optimization and intelligence insights.',
    icon: Brain,
    category: 'Integration',
    path: '/app/apps-intelligence'
  },
  {
    id: 'system-analytics',
    title: 'System Analytics',
    description: 'System activity insights and performance monitoring.',
    icon: Gauge,
    category: 'Integration',
    path: '/app/system-analytics'
  },

  // Analytics Dashboard (7 apps)
  {
    id: 'performance-reports',
    title: 'Performance Reports',
    description: 'Comprehensive performance analytics and reporting.',
    icon: FileText,
    category: 'Analytics',
    path: '/app/performance-reports'
  },
  {
    id: 'pipeline-visualization',
    title: 'Pipeline Visualization',
    description: 'Advanced pipeline charts and visual analytics.',
    icon: PieChart,
    category: 'Analytics',
    path: '/app/pipeline-visualization'
  },
  {
    id: 'revenue-breakdown',
    title: 'Revenue Breakdown',
    description: 'Detailed revenue breakdown and analysis dashboard.',
    icon: LineChart,
    category: 'Analytics',
    path: '/app/revenue-breakdown'
  },
  {
    id: 'conversion-analytics',
    title: 'Conversion Analytics',
    description: 'Conversion rate metrics and optimization insights.',
    icon: Target,
    category: 'Analytics',
    path: '/app/conversion-analytics'
  },
  {
    id: 'live-kpi-monitor',
    title: 'Live KPI Monitor',
    description: 'Real-time KPI dashboard with AI-powered insights.',
    icon: Gauge,
    category: 'Analytics',
    path: '/app/live-kpi-monitor'
  },
  {
    id: 'activity-dashboard',
    title: 'Activity Dashboard',
    description: 'Comprehensive activity metrics and trends.',
    icon: Activity,
    category: 'Analytics',
    path: '/app/activity-dashboard'
  },
  {
    id: 'trend-intelligence',
    title: 'Trend Intelligence',
    description: 'Advanced trend analysis with predictive insights.',
    icon: TrendingUp,
    category: 'Analytics',
    path: '/app/trend-intelligence'
  },
  {
    id: 'contacts-hub',
    title: 'Advanced Contacts',
    description: 'Searchable contacts with AI lead scoring, email drafting, duplicate detection and notes.',
    icon: Users,
    category: 'Contacts',
    path: '/app/contacts-hub'
  },
  {
    id: 'dashboard-builder',
    title: 'Dashboard Builder',
    description: 'Drag-and-drop dashboards with configurable bar, line, pie and number widgets on your live data.',
    icon: BarChart3,
    category: 'Analytics',
    path: '/app/dashboard-builder'
  }
];
