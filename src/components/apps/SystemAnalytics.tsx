import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import React, { useState } from 'react';
import { Gauge, TrendingUp, Server, Cpu, HardDrive, Wifi } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';

interface SystemAnalyticsProps {
  onBack?: () => void;
}

export const SystemAnalytics: React.FC<SystemAnalyticsProps> = ({ onBack }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const systemMetrics = [
    { title: "System Uptime", value: "99.9%", change: 0.1, trend: "up" as const, color: "success" as const },
    { title: "Response Time", value: "1.2s", change: -8.3, trend: "up" as const, color: "success" as const },
    { title: "Active Users", value: "247", change: 12.7, trend: "up" as const, color: "primary" as const },
    { title: "API Requests", value: "2.4M", change: 18.5, trend: "up" as const, color: "primary" as const }
  ];

  const systemComponents = [
    { name: "Web Server", status: "Healthy", cpu: 45, memory: 62, uptime: "99.9%" },
    { name: "Database Server", status: "Healthy", cpu: 38, memory: 71, uptime: "99.8%" },
    { name: "API Gateway", status: "Warning", cpu: 85, memory: 78, uptime: "99.5%" },
    { name: "Cache Server", status: "Healthy", cpu: 25, memory: 43, uptime: "100%" },
    { name: "Background Jobs", status: "Healthy", cpu: 32, memory: 55, uptime: "99.7%" }
  ];

  const performanceMetrics = [
    { metric: "Page Load Time", current: "2.1s", target: "< 3s", status: "good" },
    { metric: "API Response Time", current: "450ms", target: "< 500ms", status: "good" },
    { metric: "Database Query Time", current: "85ms", target: "< 100ms", status: "excellent" },
    { metric: "Memory Usage", current: "68%", target: "< 80%", status: "good" },
    { metric: "CPU Utilization", current: "45%", target: "< 70%", status: "excellent" },
    { metric: "Disk Usage", current: "34%", target: "< 80%", status: "excellent" }
  ];

  const activityInsights = [
    { time: "00:00", users: 12, requests: 450 },
    { time: "06:00", users: 45, requests: 1200 },
    { time: "09:00", users: 189, requests: 4800 },
    { time: "12:00", users: 247, requests: 6200 },
    { time: "15:00", users: 198, requests: 5100 },
    { time: "18:00", users: 89, requests: 2800 },
    { time: "21:00", users: 34, requests: 950 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-green-600 bg-green-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage > 90) return 'bg-red-500';
    if (usage > 70) return 'bg-yellow-500';
    if (usage > 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <PageWrapper
      title="System Analytics"
      description="System activity insights and performance monitoring"
      onBack={onBack}
      appTheme="teal"
      headerActions={
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      }
    >
      <AIAnalysisSection
        appId="system-analytics"
        analysisType="integration"
        title="AI System Analytics Analysis"
        description="System activity insights and performance monitoring."
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Gauge className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="System Components Health"
          description="Real-time status of all system components"
          icon={<Server className="w-6 h-6 text-teal-600" />}
        >
          <div className="space-y-4">
            {systemComponents.map((component, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{component.name}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(component.status)}`}>
                    {component.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">CPU</p>
                    <p className="font-semibold text-gray-900">{component.cpu}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Memory</p>
                    <p className="font-semibold text-gray-900">{component.memory}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Uptime</p>
                    <p className="font-semibold text-gray-900">{component.uptime}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">CPU Usage</span>
                    <span>{component.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(component.cpu)}`}
                      style={{ width: `${component.cpu}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Performance Metrics"
          description="Key performance indicators and targets"
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{metric.metric}</h4>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getPerformanceColor(metric.status)}`}>
                    {metric.status}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Current: </span>
                    <span className="font-semibold text-gray-900">{metric.current}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Target: </span>
                    <span className="font-semibold text-gray-900">{metric.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Activity Patterns"
          description="User activity and system load throughout the day"
          icon={<Cpu className="w-6 h-6 text-purple-600" />}
        >
          <div className="space-y-4">
            {activityInsights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{insight.time}</p>
                  <p className="text-sm text-gray-600">Peak activity time</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{insight.users} users</p>
                  <p className="text-sm text-gray-600">{insight.requests} requests</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Resource Utilization"
          description="Current system resource usage"
          icon={<HardDrive className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-6">
            <div className="p-4 bg-teal-50 rounded-lg">
              <h3 className="font-semibold text-teal-800 mb-3">Storage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-teal-700">Database</span>
                    <span className="font-medium">245 GB / 500 GB</span>
                  </div>
                  <div className="w-full bg-teal-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full w-[49%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-teal-700">File Storage</span>
                    <span className="font-medium">89 GB / 200 GB</span>
                  </div>
                  <div className="w-full bg-teal-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full w-[44%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Network</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Bandwidth Usage</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Requests/sec</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Data Transfer</span>
                  <span className="font-medium">3.2 TB/day</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="System Optimization"
        description="Recommendations to improve system performance"
        icon={<Wifi className="w-6 h-6 text-orange-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Performance</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Optimize database queries</li>
              <li>• Implement caching strategies</li>
              <li>• Compress static assets</li>
              <li>• Use CDN for global delivery</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Scalability</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Implement auto-scaling</li>
              <li>• Load balancer optimization</li>
              <li>• Database sharding strategy</li>
              <li>• Microservices architecture</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Monitoring</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Real-time alerting system</li>
              <li>• Automated health checks</li>
              <li>• Performance benchmarking</li>
              <li>• Predictive failure detection</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};