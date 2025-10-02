import React, { useState } from 'react';
import { Eye, TrendingUp, Clock, Zap, AlertCircle, BarChart3 } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';

interface AppsPerformanceProps {
  onBack: () => void;
}

export const AppsPerformance: React.FC<AppsPerformanceProps> = ({ onBack }) => {
  const [selectedMetric, setSelectedMetric] = useState('response-time');

  const performanceMetrics = [
    { title: "Avg Response Time", value: "1.2s", change: -15.3, trend: "up" as const, color: "success" as const },
    { title: "Uptime", value: "99.8%", change: 0.2, trend: "up" as const, color: "success" as const },
    { title: "API Calls", value: "2.4M", change: 23.7, trend: "up" as const, color: "primary" as const },
    { title: "Error Rate", value: "0.3%", change: -45.2, trend: "up" as const, color: "success" as const }
  ];

  const appPerformance = [
    { name: "Pipeline Intelligence", responseTime: "0.8s", uptime: "99.9%", load: 85, status: "excellent" },
    { name: "Deal Risk Monitor", responseTime: "1.1s", uptime: "99.7%", load: 67, status: "good" },
    { name: "Smart Followups", responseTime: "0.9s", uptime: "99.8%", load: 72, status: "good" },
    { name: "Activity Analytics", responseTime: "1.5s", uptime: "99.5%", load: 91, status: "warning" },
    { name: "Email Optimizer", responseTime: "2.1s", uptime: "99.2%", load: 95, status: "critical" },
    { name: "Sentiment Monitor", responseTime: "1.0s", uptime: "99.9%", load: 58, status: "excellent" }
  ];

  const performanceAlerts = [
    {
      app: "Email Optimizer",
      issue: "High response time detected",
      severity: "High",
      time: "5 minutes ago",
      recommendation: "Scale up server resources"
    },
    {
      app: "Activity Analytics", 
      issue: "CPU usage above 90%",
      severity: "Medium",
      time: "12 minutes ago",
      recommendation: "Optimize database queries"
    },
    {
      app: "Deal Risk Monitor",
      issue: "Memory usage increasing",
      severity: "Low",
      time: "1 hour ago", 
      recommendation: "Monitor memory leaks"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <PageWrapper
      title="Apps Performance Monitor"
      description="Monitor and optimize app integration performance"
      onBack={onBack}
      appTheme="green"
      headerActions={
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="response-time">Response Time</option>
          <option value="uptime">Uptime</option>
          <option value="load">Server Load</option>
          <option value="errors">Error Rate</option>
        </select>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Eye className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Application Performance"
          description="Real-time performance metrics for all apps"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            {appPerformance.map((app, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{app.name}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(app.status)}`}>
                    {app.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Response</p>
                    <p className="font-semibold text-gray-900">{app.responseTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Uptime</p>
                    <p className="font-semibold text-gray-900">{app.uptime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Load</p>
                    <p className="font-semibold text-gray-900">{app.load}%</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      app.load < 70 ? 'bg-green-500' :
                      app.load < 85 ? 'bg-blue-500' :
                      app.load < 95 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${app.load}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Performance Alerts"
          description="Critical issues requiring immediate attention"
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
        >
          <div className="space-y-4">
            {performanceAlerts.map((alert, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{alert.app}</h4>
                    <p className="text-sm text-gray-600">{alert.issue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">{alert.time}</div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Recommendation:</span> {alert.recommendation}
                  </p>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <ModernButton variant="primary" size="sm">
                    Take Action
                  </ModernButton>
                  <ModernButton variant="outline" size="sm">
                    View Details
                  </ModernButton>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Performance Optimization"
        description="Strategies to improve application performance"
        icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Infrastructure</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Auto-scaling based on load</li>
              <li>• CDN for static assets</li>
              <li>• Database query optimization</li>
              <li>• Caching strategy implementation</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Monitoring</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Real-time performance alerts</li>
              <li>• Custom dashboard creation</li>
              <li>• Automated health checks</li>
              <li>• Performance trend analysis</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Development</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Code profiling and optimization</li>
              <li>• Async processing implementation</li>
              <li>• API rate limiting</li>
              <li>• Resource cleanup automation</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};