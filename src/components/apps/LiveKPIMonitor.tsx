import React, { useState, useEffect } from 'react';
import { Gauge, Activity, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface LiveKPIMonitorProps {
  onBack?: () => void;
}

export const LiveKPIMonitor: React.FC<LiveKPIMonitorProps> = ({ onBack }) => {
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedDashboard, setSelectedDashboard] = useState('sales');

  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        // Simulate real-time data updates
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLiveMode]);

  const salesKPIs = [
    { title: "Revenue Today", value: "$47.2K", change: 12.3, trend: "up" as const, color: "success" as const, status: "healthy" },
    { title: "Active Deals", value: "156", change: 8.7, trend: "up" as const, color: "primary" as const, status: "healthy" },
    { title: "Conversion Rate", value: "23.8%", change: 5.2, trend: "up" as const, color: "success" as const, status: "healthy" },
    { title: "Pipeline Velocity", value: "28 days", change: -15.3, trend: "up" as const, color: "success" as const, status: "healthy" }
  ];

  const operationalKPIs = [
    { title: "System Uptime", value: "99.9%", change: 0.1, trend: "up" as const, color: "success" as const, status: "healthy" },
    { title: "Response Time", value: "1.2s", change: -8.5, trend: "up" as const, color: "success" as const, status: "healthy" },
    { title: "Active Users", value: "247", change: 15.7, trend: "up" as const, color: "primary" as const, status: "healthy" },
    { title: "Error Rate", value: "0.3%", change: -45.2, trend: "up" as const, color: "success" as const, status: "healthy" }
  ];

  const marketingKPIs = [
    { title: "Website Traffic", value: "12.5K", change: 23.4, trend: "up" as const, color: "primary" as const, status: "healthy" },
    { title: "Lead Generation", value: "89", change: 18.9, trend: "up" as const, color: "success" as const, status: "healthy" },
    { title: "Email Open Rate", value: "34.2%", change: 8.1, trend: "up" as const, color: "success" as const, status: "healthy" },
    { title: "Social Engagement", value: "1.8K", change: 25.6, trend: "up" as const, color: "primary" as const, status: "healthy" }
  ];

  const kpiAlerts = [
    {
      metric: "Server Response Time",
      current: "2.1s",
      threshold: "< 2.0s",
      severity: "Warning",
      time: "2 minutes ago",
      trend: "increasing"
    },
    {
      metric: "Daily Lead Goal",
      current: "67",
      threshold: "80+",
      severity: "Info",
      time: "1 hour ago",
      trend: "below target"
    },
    {
      metric: "Conversion Rate",
      current: "23.8%",
      threshold: "> 25%",
      severity: "Info", 
      time: "3 hours ago",
      trend: "improving"
    }
  ];

  const getDashboardKPIs = () => {
    switch (selectedDashboard) {
      case 'sales': return salesKPIs;
      case 'operations': return operationalKPIs;
      case 'marketing': return marketingKPIs;
      default: return salesKPIs;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <select
        value={selectedDashboard}
        onChange={(e) => setSelectedDashboard(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="sales">Sales KPIs</option>
        <option value="operations">Operations KPIs</option>
        <option value="marketing">Marketing KPIs</option>
      </select>
      <ModernButton
        variant={isLiveMode ? "primary" : "outline"}
        onClick={() => setIsLiveMode(!isLiveMode)}
      >
        <Activity className="w-4 h-4" />
        {isLiveMode ? "Live Mode ON" : "Live Mode OFF"}
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Live KPI Monitor"
      description="Real-time KPI dashboard with AI-powered insights"
      onBack={onBack}
      appTheme="purple"
      headerActions={headerActions}
    >
      {/* Live Status */}
      <div className="mb-6">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-green-800 font-medium">
            {isLiveMode ? 'Real-time monitoring active' : 'Real-time monitoring paused'} • Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* AI Analysis Section */}
      <AIAnalysisSection
        appId="live-kpi-monitor"
        analysisType="analytics"
        title="AI KPI Intelligence"
        description="Real-time AI analysis of KPI performance and optimization opportunities"
        className="mb-8"
        defaultProvider="openai-fast"
      />

      {/* Live KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {getDashboardKPIs().map((kpi, index) => (
          <div key={index} className="relative">
            <KPICard
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              color={kpi.color}
              icon={<Gauge className="w-6 h-6" />}
            />
            {/* Live indicator */}
            {isLiveMode && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="KPI Alerts & Thresholds"
          description="Automated alerts based on performance thresholds"
          icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            {kpiAlerts.map((alert, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{alert.metric}</h4>
                    <p className="text-sm text-gray-600">
                      Current: <span className="font-medium">{alert.current}</span> | 
                      Target: <span className="font-medium">{alert.threshold}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{alert.time}</span>
                  <span className={`font-medium ${
                    alert.trend === 'improving' ? 'text-green-600' :
                    alert.trend === 'increasing' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {alert.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Performance Trends"
          description="Real-time trend analysis and predictions"
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Today's Highlights</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Revenue Target Progress</span>
                  <span className="font-medium">78% ($47.2K of $60K)</span>
                </div>
                <div className="flex justify-between">
                  <span>Deal Velocity</span>
                  <span className="font-medium">15% faster than average</span>
                </div>
                <div className="flex justify-between">
                  <span>Team Performance</span>
                  <span className="font-medium">Above target across all metrics</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Trending Up</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Conversion rate improved 5.2% today</li>
                <li>• Pipeline velocity accelerated by 15%</li>
                <li>• Customer engagement up 23%</li>
                <li>• System performance optimized</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Watch Areas</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Response time approaching threshold</li>
                <li>• Daily lead generation below target</li>
                <li>• Need to accelerate 3 enterprise deals</li>
              </ul>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="AI-Powered KPI Insights"
        description="Intelligent recommendations based on real-time data"
        icon={<Zap className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Predictive Alerts</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Revenue likely to exceed target by 8%</li>
              <li>• Server scaling recommended in 2 hours</li>
              <li>• Conversion rate trend suggests 25% by EOD</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Optimization Opportunities</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Focus on high-value deals for revenue boost</li>
              <li>• Implement caching to improve response time</li>
              <li>• Schedule follow-ups for warm leads</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Strategic Insights</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Peak performance hours: 10 AM - 2 PM</li>
              <li>• Team productivity 23% above baseline</li>
              <li>• Customer satisfaction trending positive</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};