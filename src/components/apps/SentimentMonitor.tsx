import React, { useState } from 'react';
import { Heart, TrendingUp, MessageSquare, AlertCircle, Smile, Frown } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface SentimentMonitorProps {
  onBack?: () => void;
}

export const SentimentMonitor: React.FC<SentimentMonitorProps> = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('7d');

  const sentimentMetrics = [
    { title: "Overall Sentiment", value: "78%", change: 5.2, trend: "up" as const, color: "success" as const },
    { title: "Positive Interactions", value: "1,247", change: 12.8, trend: "up" as const, color: "success" as const },
    { title: "Sentiment Score", value: "8.2/10", change: 8.5, trend: "up" as const, color: "primary" as const },
    { title: "Response Satisfaction", value: "92%", change: 3.7, trend: "up" as const, color: "success" as const }
  ];

  const sentimentBreakdown = [
    { sentiment: "Very Positive", count: 456, percentage: 38, color: "bg-green-500" },
    { sentiment: "Positive", count: 523, percentage: 43, color: "bg-blue-500" },
    { sentiment: "Neutral", count: 189, percentage: 16, color: "bg-gray-400" },
    { sentiment: "Negative", count: 28, percentage: 2, color: "bg-yellow-500" },
    { sentiment: "Very Negative", count: 12, percentage: 1, color: "bg-red-500" }
  ];

  const recentAlerts = [
    {
      type: "negative",
      client: "TechCorp Solutions",
      message: "Expressed frustration with response time",
      time: "15 minutes ago",
      priority: "high"
    },
    {
      type: "positive",
      client: "Global Industries",
      message: "Praised team's technical expertise",
      time: "1 hour ago",
      priority: "low"
    },
    {
      type: "neutral",
      client: "Innovation Labs",
      message: "Asked for pricing clarification",
      time: "2 hours ago",
      priority: "medium"
    }
  ];

  const getSentimentIcon = (type: string) => {
    switch (type) {
      case 'positive': return <Smile className="w-5 h-5 text-green-600" />;
      case 'negative': return <Frown className="w-5 h-5 text-red-600" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <PageWrapper
      title="Sentiment Monitor"
      description="Real-time sentiment analysis across all communications"
      onBack={onBack}
      appTheme="emerald"
      headerActions={
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      }
    >
      <AIAnalysisSection
        appId="sentiment-monitor"
        analysisType="communication"
        title="AI Sentiment Monitor Analysis"
        description="Real-time sentiment analysis across all communications."
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sentimentMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Heart className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Sentiment Breakdown"
          description="Distribution of sentiment across all interactions"
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
        >
          <div className="space-y-4">
            {sentimentBreakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{item.sentiment}</span>
                    <span className="text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage * 2}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Recent Sentiment Alerts"
          description="Important sentiment changes requiring attention"
          icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            {recentAlerts.map((alert, index) => (
              <div key={index} className={`p-4 border rounded-lg ${getAlertColor(alert.priority)}`}>
                <div className="flex items-start gap-3">
                  {getSentimentIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{alert.client}</h4>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex gap-2">
                      <ModernButton variant="primary" size="sm">
                        View Details
                      </ModernButton>
                      <ModernButton variant="outline" size="sm">
                        Take Action
                      </ModernButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Sentiment Insights"
        description="AI-generated insights and recommendations"
        icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Positive Trends</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Response time improvements noted</li>
              <li>• Technical support highly rated</li>
              <li>• Product quality mentions up 23%</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Areas of Concern</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Pricing concerns increasing</li>
              <li>• Documentation clarity issues</li>
              <li>• Onboarding complexity mentioned</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Recommendations</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Address pricing transparency</li>
              <li>• Improve documentation clarity</li>
              <li>• Streamline onboarding process</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};