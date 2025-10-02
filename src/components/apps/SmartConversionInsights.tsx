import React, { useState } from 'react';
import { ArrowLeft, Target, TrendingUp, Users, Lightbulb, Zap } from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { GlassCard } from '../ui/GlassCard';
import { AIChart } from '../AIChart';
import { PageWrapper } from '../layout/PageWrapper';

interface SmartConversionInsightsProps {
  onBack: () => void;
}

export const SmartConversionInsights: React.FC<SmartConversionInsightsProps> = ({ onBack }) => {
  const [selectedSegment, setSelectedSegment] = useState('enterprise');

  const conversionOpportunities = [
    {
      id: 1,
      title: "High-Value Enterprise Leads",
      description: "23 enterprise prospects showing strong buying signals",
      potentialRevenue: "$890K",
      conversionProbability: "73%",
      timeToClose: "45 days",
      actionItems: ["Schedule exec meetings", "Provide ROI calculator", "Share case studies"],
      priority: "high"
    },
    {
      id: 2,
      title: "Mid-Market Expansion",
      description: "15 existing clients ready for upsell opportunities",
      potentialRevenue: "$340K",
      conversionProbability: "85%",
      timeToClose: "21 days",
      actionItems: ["Present upgrade options", "Schedule product demos", "Negotiate terms"],
      priority: "high"
    },
    {
      id: 3,
      title: "SMB Quick Wins",
      description: "67 small business leads with immediate needs",
      potentialRevenue: "$180K",
      conversionProbability: "65%",
      timeToClose: "14 days",
      actionItems: ["Send pricing proposals", "Offer limited-time discounts", "Follow up calls"],
      priority: "medium"
    }
  ];

  const conversionMetrics = [
    { label: "Conversion Rate", value: "23.8%", change: "+4.2%", trend: "up" },
    { label: "Avg Time to Convert", value: "32 days", change: "-5 days", trend: "up" },
    { label: "Revenue per Convert", value: "$28K", change: "+12%", trend: "up" },
    { label: "Hot Prospects", value: "156", change: "+23", trend: "up" }
  ];

  const segmentData = {
    enterprise: { rate: "73%", revenue: "$890K", prospects: 23 },
    midmarket: { rate: "65%", revenue: "$340K", prospects: 45 },
    smb: { rate: "45%", revenue: "$180K", prospects: 67 }
  };

  return (
    <PageWrapper
      title="Smart Conversion Insights"
      description="AI-powered conversion opportunities and optimization"
      onBack={onBack}
      appTheme="green"
    >
      {/* Update all text colors for dark mode */}
        {/* Conversion Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {conversionMetrics.map((metric, index) => (
            <AIChart
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              data={[45, 52, 48, 65, 72, 68, 85, 92, 88, 95, 103, 97]}
            />
          ))}
        </div>

        {/* Segment Analysis */}
        <GlassCard className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Conversion by Segment</h2>
            <div className="flex gap-2">
              {Object.keys(segmentData).map(segment => (
                <ModernButton
                  key={segment}
                  variant={selectedSegment === segment ? 'primary' : 'ghost'}
                  onClick={() => setSelectedSegment(segment)}
                  className="capitalize"
                  size="sm"
                >
                  {segment === 'smb' ? 'SMB' : segment}
                </ModernButton>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{segmentData[selectedSegment as keyof typeof segmentData].rate}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Potential Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{segmentData[selectedSegment as keyof typeof segmentData].revenue}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Active Prospects</p>
              <p className="text-3xl font-bold text-gray-900">{segmentData[selectedSegment as keyof typeof segmentData].prospects}</p>
            </div>
          </div>
        </GlassCard>

        {/* Conversion Opportunities */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Top Conversion Opportunities</h2>
          </div>
          
          {conversionOpportunities.map((opportunity, index) => (
            <GlassCard key={opportunity.id} className="animate-slide-in">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    opportunity.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <Target className={`w-6 h-6 ${
                      opportunity.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{opportunity.title}</h3>
                    <p className="text-gray-600 mt-1">{opportunity.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  opportunity.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {opportunity.priority} Priority
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Potential Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{opportunity.potentialRevenue}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Conversion Probability</p>
                  <p className="text-2xl font-bold text-blue-600">{opportunity.conversionProbability}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Est. Time to Close</p>
                  <p className="text-2xl font-bold text-purple-600">{opportunity.timeToClose}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">AI-Recommended Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {opportunity.actionItems.map((action, actionIndex) => (
                    <div key={actionIndex} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Zap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <ModernButton variant="primary">
                  Start Campaign
                </ModernButton>
                <ModernButton variant="outline">
                  View Prospects
                </ModernButton>
                <ModernButton variant="ghost">
                  Get More Details
                </ModernButton>
              </div>
            </GlassCard>
          ))}
        </div>
    </PageWrapper>
  );
};