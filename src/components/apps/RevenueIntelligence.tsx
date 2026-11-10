import React, { useState } from 'react';
import { DollarSign, TrendingUp, Target, Zap, PieChart } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';

interface RevenueIntelligenceProps {
  onBack?: () => void;
}

export const RevenueIntelligence: React.FC<RevenueIntelligenceProps> = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('quarterly');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const revenueMetrics = [
    { title: "Total Revenue", value: "$2.8M", change: 18.5, trend: "up" as const, color: "success" as const },
    { title: "Revenue Growth", value: "+23%", change: 12.1, trend: "up" as const, color: "success" as const },
    { title: "Revenue per Deal", value: "$45K", change: 8.7, trend: "up" as const, color: "primary" as const },
    { title: "Recurring Revenue", value: "$1.2M", change: 25.3, trend: "up" as const, color: "success" as const }
  ];

  const revenueSegments = [
    { segment: "Enterprise", revenue: "$1.2M", growth: "+32%", percentage: 43 },
    { segment: "Mid-Market", revenue: "$890K", growth: "+18%", percentage: 32 },
    { segment: "SMB", revenue: "$710K", growth: "+12%", percentage: 25 }
  ];

  const runRevenueAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  };

  const headerActions = (
    <>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="yearly">Yearly</option>
      </select>
      <ModernButton onClick={runRevenueAnalysis} loading={isAnalyzing}>
        <Zap className="w-4 h-4" />
        Analyze Revenue
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Revenue Intelligence"
      description="Advanced revenue analytics and optimization insights"
      onBack={onBack}
      appTheme="green"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isAnalyzing} 
          message="AI is analyzing revenue patterns and trends..."
          type="brain"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {revenueMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<DollarSign className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Revenue by Segment"
          description="Performance breakdown by customer segment"
          icon={<PieChart className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            {revenueSegments.map((segment, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{segment.segment}</h3>
                  <span className="text-green-600 font-medium">{segment.growth}</span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-bold text-gray-900">{segment.revenue}</p>
                  <p className="text-sm text-gray-600">{segment.percentage}% of total</p>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${segment.percentage * 2}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Revenue Trends"
          description="Month-over-month revenue analysis"
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Growth Drivers</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">New Customer Acquisition</span>
                  <span className="font-medium">+35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Upsell Revenue</span>
                  <span className="font-medium">+28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Contract Renewals</span>
                  <span className="font-medium">+18%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Revenue Quality</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Recurring Revenue</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Customer Retention</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Gross Margin</span>
                  <span className="font-medium">74%</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Revenue Optimization"
        description="AI recommendations to maximize revenue"
        icon={<Target className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Pricing Optimization</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Increase enterprise pricing by 8%</li>
              <li>• Introduce value-based tiers</li>
              <li>• Optimize discount strategies</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Market Expansion</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Target new geographical markets</li>
              <li>• Develop mid-market solutions</li>
              <li>• Partner channel development</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Customer Success</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Implement customer health scores</li>
              <li>• Proactive renewal management</li>
              <li>• Upsell automation</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};