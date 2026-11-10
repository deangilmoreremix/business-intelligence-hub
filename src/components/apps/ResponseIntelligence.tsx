import React, { useState } from 'react';
import { Clock3, MessageSquare, TrendingUp, AlertCircle, Zap, Mail } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface ResponseIntelligenceProps {
  onBack?: () => void;
}

export const ResponseIntelligence: React.FC<ResponseIntelligenceProps> = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [channelFilter, setChannelFilter] = useState('all');

  const responseMetrics = [
    { title: "Avg Response Time", value: "2.3h", change: -15.2, trend: "up" as const, color: "success" as const },
    { title: "Response Rate", value: "87%", change: 8.4, trend: "up" as const, color: "primary" as const },
    { title: "First Touch Speed", value: "12m", change: -25.7, trend: "up" as const, color: "success" as const },
    { title: "Resolution Time", value: "4.2h", change: -12.1, trend: "up" as const, color: "primary" as const }
  ];

  const channelData = [
    { channel: "Email", avgTime: "1.8h", volume: 247, rate: 92, trend: "improving" },
    { channel: "Phone", avgTime: "0.5h", volume: 156, rate: 89, trend: "stable" },
    { channel: "Chat", avgTime: "3m", volume: 89, rate: 94, trend: "improving" },
    { channel: "Social", avgTime: "2.1h", volume: 34, rate: 78, trend: "declining" }
  ];

  const responseAlerts = [
    {
      id: 1,
      type: "urgent",
      message: "3 high-value prospects waiting >4 hours",
      channel: "Email",
      count: 3,
      priority: "high"
    },
    {
      id: 2,
      type: "warning",
      message: "Response rate below target for social media",
      channel: "Social",
      count: 8,
      priority: "medium"
    },
    {
      id: 3,
      type: "info",
      message: "Chat response time improved by 40%",
      channel: "Chat",
      count: 0,
      priority: "low"
    }
  ];

  const headerActions = (
    <>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
      <select
        value={channelFilter}
        onChange={(e) => setChannelFilter(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Channels</option>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
        <option value="chat">Chat</option>
        <option value="social">Social</option>
      </select>
    </>
  );

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Clock3 className="w-5 h-5 text-yellow-600" />;
      case 'info': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <PageWrapper
      title="Response Intelligence"
      description="Track and optimize response times across all communication channels"
      onBack={onBack}
      headerActions={headerActions}
    >
      <AIAnalysisSection
        appId="response-intelligence"
        analysisType="communication"
        title="AI Response Intelligence Analysis"
        description="Track and optimize response times across all communication channels."
        className="mb-8"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {responseMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Clock3 className="w-6 h-6" />}
          />
        ))}
      </div>

      {/* Response Alerts */}
      <Section
        title="Response Alerts"
        description="Urgent notifications requiring immediate attention"
        icon={<AlertCircle className="w-6 h-6 text-red-600" />}
        className="mb-8"
      >
        <div className="space-y-4">
          {responseAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{alert.message}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">{alert.channel}</span>
                      {alert.count > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          {alert.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ModernButton variant="primary" size="sm">
                      Take Action
                    </ModernButton>
                    <ModernButton variant="outline" size="sm">
                      View Details
                    </ModernButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Channel Performance */}
        <Section
          title="Channel Response Times"
          description="Performance breakdown by communication channel"
          icon={<MessageSquare className="w-6 h-6 text-teal-600" />}
        >
          <div className="space-y-4">
            {channelData.map((channel, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-teal-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{channel.channel}</h3>
                      <p className="text-sm text-gray-600">{channel.volume} messages</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    channel.trend === 'improving' ? 'bg-green-100 text-green-800' :
                    channel.trend === 'declining' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {channel.trend}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                    <p className="font-bold text-2xl text-gray-900">{channel.avgTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="font-bold text-2xl text-gray-900">{channel.rate}%</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${channel.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Team Performance */}
        <Section
          title="Team Response Performance"
          description="Individual response time metrics"
          icon={<TrendingUp className="w-6 h-6 text-cyan-600" />}
        >
          <div className="space-y-4">
            {teamMembers.slice(0, 5).map((member) => {
              const avgTime = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
              const responseRate = Math.floor(Math.random() * 20) + 80; // 80-100%
              
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
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">{avgTime}m</p>
                    <p className="text-sm text-gray-600">{responseRate}% rate</p>
                    <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      avgTime < 60 ? 'bg-green-100 text-green-800' :
                      avgTime < 120 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {avgTime < 60 ? 'Excellent' : avgTime < 120 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* AI Recommendations */}
      <Section
        title="Response Optimization"
        description="AI recommendations to improve response times"
        icon={<Zap className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Quick Wins</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Set up auto-acknowledgment emails</li>
              <li>• Create response time targets</li>
              <li>• Enable mobile notifications</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Process Improvements</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Implement response templates</li>
              <li>• Route urgent inquiries faster</li>
              <li>• Track response quality metrics</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Advanced Features</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• AI-powered response suggestions</li>
              <li>• Smart priority scoring</li>
              <li>• Predictive response scheduling</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};