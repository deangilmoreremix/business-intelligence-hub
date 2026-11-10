import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import React, { useState } from 'react';
import { Settings, TrendingUp, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';

interface IntegrationAnalyticsProps {
  onBack?: () => void;
}

export const IntegrationAnalytics: React.FC<IntegrationAnalyticsProps> = ({ onBack }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const integrationMetrics = [
    { title: "Active Integrations", value: "24", change: 12.5, trend: "up" as const, color: "success" as const },
    { title: "Sync Success Rate", value: "98.7%", change: 2.3, trend: "up" as const, color: "success" as const },
    { title: "Data Throughput", value: "2.4M", change: 18.9, trend: "up" as const, color: "primary" as const },
    { title: "Uptime", value: "99.9%", change: 0.1, trend: "up" as const, color: "success" as const }
  ];

  const integrations = [
    { name: "Salesforce CRM", status: "Connected", lastSync: "2 min ago", records: "15.2K", health: 98 },
    { name: "HubSpot Marketing", status: "Connected", lastSync: "5 min ago", records: "8.7K", health: 95 },
    { name: "Slack Workspace", status: "Connected", lastSync: "1 min ago", records: "2.3K", health: 100 },
    { name: "Google Workspace", status: "Syncing", lastSync: "syncing...", records: "45.1K", health: 87 },
    { name: "Microsoft Teams", status: "Connected", lastSync: "3 min ago", records: "5.8K", health: 92 },
    { name: "Zoom Meetings", status: "Warning", lastSync: "2 hours ago", records: "1.2K", health: 67 }
  ];

  const syncActivities = [
    { platform: "Salesforce", activity: "Contact sync completed", time: "2 min ago", status: "success" },
    { platform: "HubSpot", activity: "Lead data updated", time: "8 min ago", status: "success" },
    { platform: "Zoom", activity: "Meeting recordings synced", time: "15 min ago", status: "warning" },
    { platform: "Slack", activity: "Message history updated", time: "22 min ago", status: "success" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': return 'text-green-600 bg-green-100';
      case 'Syncing': return 'text-blue-600 bg-blue-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <PageWrapper
      title="Integration Analytics"
      description="Cross-platform activity sync and integration insights"
      onBack={onBack}
      appTheme="blue"
      headerActions={
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
      <AIAnalysisSection
          appId="integration-analytics"
          analysisType="integration"
          title="AI Integration Analytics Analysis"
          description="Cross-platform activity sync and integration insights."
          className="mb-8"
        />

          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {integrationMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Settings className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Integration Status"
          description="Real-time status of all platform integrations"
          icon={<Settings className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {integrations.map((integration, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600">{integration.records} records</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last sync: {integration.lastSync}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Health:</span>
                    <span className={`font-medium ${
                      integration.health > 90 ? 'text-green-600' :
                      integration.health > 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {integration.health}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Recent Sync Activity"
          description="Latest synchronization activities across platforms"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            {syncActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                {getActivityIcon(activity.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{activity.platform}</h4>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Integration Performance"
        description="Analytics and optimization insights"
        icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Performance Metrics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Avg Sync Time</span>
                <span className="font-medium">2.3 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Success Rate</span>
                <span className="font-medium">98.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Data Accuracy</span>
                <span className="font-medium">99.2%</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Optimization Opportunities</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Batch sync operations during off-peak hours</li>
              <li>• Implement incremental sync for large datasets</li>
              <li>• Set up monitoring alerts for failures</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Recommendations</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Add Microsoft Dynamics integration</li>
              <li>• Implement real-time sync for critical data</li>
              <li>• Create custom webhooks for instant updates</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};