import React, { useState } from 'react';
import { Target, Users, Zap, BarChart3, PieChart } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface ConversionAnalyticsProps {
  onBack?: () => void;
}

export const ConversionAnalytics: React.FC<ConversionAnalyticsProps> = ({ onBack }) => {
  const [selectedFunnel, setSelectedFunnel] = useState('sales');
  const [timeFrame, setTimeFrame] = useState('30d');

  const conversionMetrics = [
    { title: "Overall Conversion", value: "23.8%", change: 8.3, trend: "up" as const, color: "success" as const },
    { title: "Lead to Opportunity", value: "65%", change: 12.5, trend: "up" as const, color: "primary" as const },
    { title: "Opportunity to Close", value: "36.6%", change: 5.7, trend: "up" as const, color: "success" as const },
    { title: "Avg Time to Convert", value: "28 days", change: -15.3, trend: "up" as const, color: "success" as const }
  ];

  const funnelStages = [
    { stage: "Visitors", count: 12543, conversion: 100, dropOff: 0 },
    { stage: "Leads", count: 2847, conversion: 22.7, dropOff: 77.3 },
    { stage: "Qualified Leads", count: 1851, conversion: 14.8, dropOff: 35.0 },
    { stage: "Opportunities", count: 892, conversion: 7.1, dropOff: 51.8 },
    { stage: "Proposals", count: 453, conversion: 3.6, dropOff: 49.2 },
    { stage: "Closed Won", count: 167, conversion: 1.3, dropOff: 63.1 }
  ];

  const conversionByChannel = [
    { channel: "Organic Search", leads: 1245, conversions: 312, rate: 25.1 },
    { channel: "Paid Ads", leads: 892, conversions: 198, rate: 22.2 },
    { channel: "Email Marketing", leads: 567, conversions: 156, rate: 27.5 },
    { channel: "Social Media", leads: 434, conversions: 87, rate: 20.0 },
    { channel: "Referrals", leads: 298, conversions: 89, rate: 29.9 },
    { channel: "Direct", leads: 189, conversions: 67, rate: 35.4 }
  ];

  const conversionBySegment = [
    { segment: "Enterprise", prospects: 234, conversions: 89, rate: 38.0, value: "$125K" },
    { segment: "Mid-Market", prospects: 567, conversions: 178, rate: 31.4, value: "$45K" },
    { segment: "SMB", prospects: 892, conversions: 245, rate: 27.5, value: "$12K" }
  ];

  const conversionInsights = [
    {
      insight: "Email Marketing Best Performer",
      description: "Email campaigns show 27.5% conversion rate, 3x higher than social media",
      action: "Increase email marketing budget by 40%",
      impact: "High"
    },
    {
      insight: "Enterprise Segment Opportunity",
      description: "Enterprise prospects convert at 38% but represent only 14% of total leads",
      action: "Develop enterprise-focused lead generation campaigns",
      impact: "High"
    },
    {
      insight: "Proposal Stage Bottleneck",
      description: "49% drop-off rate from opportunity to proposal stage",
      action: "Streamline proposal process and reduce time to delivery",
      impact: "Medium"
    }
  ];

  const getConversionColor = (rate: number) => {
    if (rate >= 30) return 'text-green-600 bg-green-100';
    if (rate >= 25) return 'text-blue-600 bg-blue-100';
    if (rate >= 20) return 'text-yellow-600 bg-yellow-100';
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

  const headerActions = (
    <>
      <select
        value={selectedFunnel}
        onChange={(e) => setSelectedFunnel(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="sales">Sales Funnel</option>
        <option value="marketing">Marketing Funnel</option>
        <option value="product">Product Funnel</option>
      </select>
      <select
        value={timeFrame}
        onChange={(e) => setTimeFrame(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>
    </>
  );

  return (
    <PageWrapper
      title="Conversion Analytics"
      description="Conversion rate metrics and optimization insights"
      onBack={onBack}
      appTheme="orange"
      headerActions={headerActions}
    >
      <AIAnalysisSection
          appId="conversion-analytics"
          analysisType="analytics"
          title="AI Conversion Analytics Analysis"
          description="Conversion rate metrics and optimization insights."
          className="mb-8"
        />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {conversionMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Target className="w-6 h-6" />}
          />
        ))}
      </div>

      <Section
        title="Conversion Funnel Analysis"
        description="Step-by-step conversion rates through the sales process"
        icon={<BarChart3 className="w-6 h-6 text-orange-600" />}
        className="mb-8"
      >
        <div className="space-y-6">
          {funnelStages.map((stage, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{stage.stage}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold text-gray-900">{stage.count.toLocaleString()}</span>
                  <span className="text-orange-600 font-medium">{stage.conversion}%</span>
                  {stage.dropOff > 0 && (
                    <span className="text-red-600">-{stage.dropOff}% drop-off</span>
                  )}
                </div>
              </div>
              
              <div className="relative mb-4">
                <div className="w-full bg-gray-200 rounded-full h-8 flex items-center">
                  <div 
                    className="bg-orange-500 h-8 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-700"
                    style={{ width: `${Math.max(stage.conversion, 5)}%` }}
                  >
                    {stage.conversion}%
                  </div>
                </div>
                
                {index < funnelStages.length - 1 && stage.dropOff > 0 && (
                  <div className="absolute right-0 top-full mt-1">
                    <span className="text-xs text-red-600 font-medium">
                      {funnelStages[index + 1] ? 
                        `${(stage.count - funnelStages[index + 1].count).toLocaleString()} lost` 
                        : ''
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Conversion by Channel"
          description="Performance comparison across acquisition channels"
          icon={<PieChart className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {conversionByChannel.map((channel, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{channel.channel}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getConversionColor(channel.rate)}`}>
                    {channel.rate}%
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Leads</p>
                    <p className="font-semibold text-gray-900">{channel.leads}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Conversions</p>
                    <p className="font-semibold text-gray-900">{channel.conversions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rate</p>
                    <p className="font-semibold text-orange-600">{channel.rate}%</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(channel.rate * 3, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Conversion by Segment"
          description="Conversion rates and value by customer segment"
          icon={<Users className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            {conversionBySegment.map((segment, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{segment.segment}</h3>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">{segment.rate}%</p>
                    <p className="text-sm text-gray-600">conversion rate</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Prospects</p>
                    <p className="font-semibold text-gray-900">{segment.prospects}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Converted</p>
                    <p className="font-semibold text-gray-900">{segment.conversions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Value</p>
                    <p className="font-semibold text-green-600">{segment.value}</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(segment.rate * 2.5, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Conversion Optimization Insights"
        description="AI-generated recommendations to improve conversion rates"
        icon={<Zap className="w-6 h-6 text-purple-600" />}
      >
        <div className="space-y-6">
          {conversionInsights.map((insight, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{insight.insight}</h4>
                  <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                </div>
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(insight.impact)}`}>
                  {insight.impact} Impact
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg mb-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Recommended Action:</span> {insight.action}
                </p>
              </div>
              
              <ModernButton variant="primary" size="sm">
                Implement Optimization
              </ModernButton>
            </div>
          ))}
        </div>
      </Section>
    </PageWrapper>
  );
};