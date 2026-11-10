import React from 'react';
import { useParams } from 'react-router-dom';
import { PipelineIntelligence } from './apps/PipelineIntelligence';
import { DealRiskMonitor } from './apps/DealRiskMonitor';
import { SmartConversionInsights } from './apps/SmartConversionInsights';
import { PipelineHealthDashboard } from './apps/PipelineHealthDashboard';
import { SalesCycleAnalytics } from './apps/SalesCycleAnalytics';
import { ActivityAnalytics } from './apps/ActivityAnalytics';
import { SmartFollowups } from './apps/SmartFollowups';
import { WinRateIntelligence } from './apps/WinRateIntelligence';
import { AISalesForecast } from './apps/AISalesForecast';
import { LiveDealAnalysis } from './apps/LiveDealAnalysis';
import { ResponseIntelligence } from './apps/ResponseIntelligence';
import { CompetitorInsights } from './apps/CompetitorInsights';
import { RevenueIntelligence } from './apps/RevenueIntelligence';
import { ChannelSyncHub } from './apps/ChannelSyncHub';
import { EmailOptimizer } from './apps/EmailOptimizer';
import { SentimentMonitor } from './apps/SentimentMonitor';
import { CommPerformance } from './apps/CommPerformance';
import { PriorityIntelligence } from './apps/PriorityIntelligence';
import { TaskImpactAnalytics } from './apps/TaskImpactAnalytics';
import { WorkflowIntelligence } from './apps/WorkflowIntelligence';
import { RiskMonitor } from './apps/RiskMonitor';
import { SmartAllocation } from './apps/SmartAllocation';
import { IntegrationAnalytics } from './apps/IntegrationAnalytics';
import { AppsPerformance } from './apps/AppsPerformance';
import { DataQuality } from './apps/DataQuality';
import { AutomationHub } from './apps/AutomationHub';
import { AppsIntelligence } from './apps/AppsIntelligence';
import { SystemAnalytics } from './apps/SystemAnalytics';
import { PerformanceReports } from './apps/PerformanceReports';
import { PipelineVisualization } from './apps/PipelineVisualization';
import { RevenueBreakdown } from './apps/RevenueBreakdown';
import { ConversionAnalytics } from './apps/ConversionAnalytics';
import { LiveKPIMonitor } from './apps/LiveKPIMonitor';
import { ActivityDashboard } from './apps/ActivityDashboard';
import { TrendIntelligence } from './apps/TrendIntelligence';
import { ContactsHub } from './contacts/ContactsHub';
import { ComingSoonPage } from './ComingSoonPage';
import { aiApps } from '../data/aiApps';

// Component mapping for all AI applications
const appComponents: Record<string, React.ComponentType<{ onBack?: () => void }>> = {
  'pipeline-intelligence': PipelineIntelligence,
  'deal-risk-monitor': DealRiskMonitor,
  'conversion-insights': SmartConversionInsights,
  'pipeline-health': PipelineHealthDashboard,
  'sales-cycle-analytics': SalesCycleAnalytics,
  'win-rate-intelligence': WinRateIntelligence,
  'ai-sales-forecast': AISalesForecast,
  'live-deal-analysis': LiveDealAnalysis,
  'competitor-insights': CompetitorInsights,
  'revenue-intelligence': RevenueIntelligence,
  'activity-analytics': ActivityAnalytics,
  'response-intelligence': ResponseIntelligence,
  'channel-sync-hub': ChannelSyncHub,
  'email-optimizer': EmailOptimizer,
  'sentiment-monitor': SentimentMonitor,
  'comm-performance': CommPerformance,
  'smart-followups': SmartFollowups,
  'priority-intelligence': PriorityIntelligence,
  'task-impact-analytics': TaskImpactAnalytics,
  'workflow-intelligence': WorkflowIntelligence,
  'risk-monitor': RiskMonitor,
  'smart-allocation': SmartAllocation,
  'integration-analytics': IntegrationAnalytics,
  'apps-performance': AppsPerformance,
  'data-quality': DataQuality,
  'automation-hub': AutomationHub,
  'apps-intelligence': AppsIntelligence,
  'system-analytics': SystemAnalytics,
  'performance-reports': PerformanceReports,
  'pipeline-visualization': PipelineVisualization,
  'revenue-breakdown': RevenueBreakdown,
  'conversion-analytics': ConversionAnalytics,
  'live-kpi-monitor': LiveKPIMonitor,
  'activity-dashboard': ActivityDashboard,
  'trend-intelligence': TrendIntelligence,
  'contacts-hub': ContactsHub
};

export const AppRoute: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  
  if (!appId) {
    return <ComingSoonPage />;
  }

  // Check if we have a component for this app
  const AppComponent = appComponents[appId];
  
  if (AppComponent) {
    return <AppComponent />;
  }

  // Check if it's a valid app from aiApps but no component yet
  const app = aiApps.find(a => a.id === appId);
  if (app) {
    return <ComingSoonPage />;
  }

  // App not found at all
  return <ComingSoonPage />;
};