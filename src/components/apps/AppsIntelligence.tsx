import React, { useState } from 'react';
import { Zap, TrendingUp, Users, BarChart3, Clock, Target } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface AppsIntelligenceProps {
  onBack?: () => void;
}

export const AppsIntelligence: React.FC<AppsIntelligenceProps> = ({ onBack }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const intelligenceMetrics = [
    { title: "App Usage Rate", value: "89%", change: 15.3, trend: "up" as const, color: "success" as const },
    { title: "User Engagement", value: "76%", change: 8.7, trend: "up" as const, color: "primary" as const },
    { title: "Feature Adoption", value: "67%", change: 23.1, trend: "up" as const, color: "success" as const },
    { title: "Productivity Gain", value: "+34%", change: 12.5, trend: "up" as const, color: "success" as const }
  ];

  const appUsage = [
    { name: "Pipeline Intelligence", usage: 95, users: 12, sessions: 247, avgTime: "8.3 min" },
    { name: "Smart Follow-ups", usage: 87, users: 9, sessions: 189, avgTime: "6.1 min" },
    { name: "Activity Analytics", usage: 82, users: 11, sessions: 203, avgTime: "5.7 min" },
    { name: "Deal Risk Monitor", usage: 78, users: 8, sessions: 156, avgTime: "7.2 min" },
    { name: "Email Optimizer", usage: 71, users: 7, sessions: 134, avgTime: "4.9 min" },
    { name: "Sentiment Monitor", usage: 65, users: 6, sessions: 98, avgTime: "3.8 min" }
  ];

  const featureAdoption = [
    { feature: "AI Insights Generation", adopted: 89, impact: "High" },
    { feature: "Automated Reporting", adopted: 76, impact: "High" },
    { feature: "Real-time Alerts", adopted: 82, impact: "Medium" },
    { feature: "Custom Dashboards", adopted: 45, impact: "Medium" },
    { feature: "API Integrations", adopted: 34, impact: "Low" }
  ];

  const usageRecommendations = [
    {
      type: "Underutilized Features",
      description: "Custom Dashboards showing low adoption (45%)",
      action: "Create training materials and demos",
      priority: "Medium"
    },
    {
      type: "High-Value Opportunities", 
      description: "API Integrations could boost productivity by 25%",
      action: "Provide technical documentation and support",
      priority: "High"
    },
    {
      type: "User Engagement",
      description: "Some team members not using advanced features",
      action: "Schedule personalized training sessions",
      priority: "Medium"
    }
  ];

  const getUsageColor = (usage: number) => {
    if (usage >= 85) return 'text-green-600 bg-green-100';
    if (usage >= 70) return 'text-blue-600 bg-blue-100';
    if (usage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <PageWrapper
      title="Apps Intelligence"
      description="Tool usage optimization and intelligence insights"
      onBack={onBack}
      appTheme="indigo"
      headerActions={
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      }
    >
      <AIAnalysisSection
        appId="apps-intelligence"
        analysisType="integration"
        title="AI Apps Intelligence Analysis"
        description="Tool usage optimization and intelligence insights."
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {intelligenceMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Zap className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Application Usage Analytics"
          description="Usage patterns and engagement metrics by app"
          icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
        >
          <div className="space-y-4">
            {appUsage.map((app, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{app.name}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getUsageColor(app.usage)}`}>
                    {app.usage}% adoption
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Active Users</p>
                    <p className="font-semibold text-gray-900">{app.users}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Sessions</p>
                    <p className="font-semibold text-gray-900">{app.sessions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Time</p>
                    <p className="font-semibold text-gray-900">{app.avgTime}</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      app.usage >= 85 ? 'bg-green-500' :
                      app.usage >= 70 ? 'bg-blue-500' :
                      app.usage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${app.usage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Feature Adoption Analysis"
          description="Individual feature usage and impact assessment"
          icon={<Target className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {featureAdoption.map((feature, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{feature.feature}</h4>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(feature.impact)}`}>
                    {feature.impact} Impact
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Adoption Rate</span>
                  <span className="font-medium">{feature.adopted}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${feature.adopted}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="User Engagement by Team Member"
          description="Individual usage patterns and preferences"
          icon={<Users className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const engagement = Math.floor(Math.random() * 30) + 60;
              const appsUsed = Math.floor(Math.random() * 5) + 3;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={member.avatar} 
                      fallback={member.initials}
                      status={member.status}
                      size="md"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{appsUsed} apps actively used</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg text-indigo-600">{engagement}%</p>
                    <p className="text-sm text-gray-600">Engagement</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section
          title="Usage Optimization Recommendations"
          description="AI-generated suggestions to improve app adoption"
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            {usageRecommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{rec.type}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg mb-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Recommended Action:</span> {rec.action}
                  </p>
                </div>
                
                <ModernButton variant="primary" size="sm">
                  Implement Recommendation
                </ModernButton>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Intelligence Insights"
        description="Strategic recommendations for tool optimization"
        icon={<Clock className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">Usage Patterns</h3>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Peak usage: Tuesday-Thursday 10-11 AM</li>
              <li>• Mobile usage growing 23% month-over-month</li>
              <li>• Advanced features adopted by power users first</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Success Metrics</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 34% productivity improvement measured</li>
              <li>• 89% user satisfaction with AI features</li>
              <li>• 67% reduction in manual reporting time</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Next Steps</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Roll out advanced training program</li>
              <li>• Develop mobile-first features</li>
              <li>• Create user champion program</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};