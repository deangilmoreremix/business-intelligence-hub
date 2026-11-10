import React, { useState } from 'react';
import { LineChart, DollarSign, TrendingUp, PieChart, BarChart3, Target } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface RevenueBreakdownProps {
  onBack?: () => void;
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({ onBack }) => {
  const [selectedBreakdown, setSelectedBreakdown] = useState('source');
  const [timeFrame, setTimeFrame] = useState('quarterly');

  const revenueMetrics = [
    { title: "Total Revenue", value: "$3.2M", change: 18.5, trend: "up" as const, color: "success" as const },
    { title: "Recurring Revenue", value: "$2.1M", change: 25.3, trend: "up" as const, color: "success" as const },
    { title: "New Business", value: "$1.1M", change: 12.7, trend: "up" as const, color: "primary" as const },
    { title: "Growth Rate", value: "+28%", change: 8.9, trend: "up" as const, color: "success" as const }
  ];

  const revenueBySource = [
    { source: "New Customers", amount: "$1.2M", percentage: 37.5, growth: "+24%" },
    { source: "Upsells", amount: "$890K", percentage: 27.8, growth: "+31%" },
    { source: "Renewals", amount: "$756K", percentage: 23.6, growth: "+18%" },
    { source: "Cross-sells", amount: "$354K", percentage: 11.1, growth: "+42%" }
  ];

  const revenueBySegment = [
    { segment: "Enterprise", amount: "$1.8M", percentage: 56.3, deals: 23, avgDeal: "$78K" },
    { segment: "Mid-Market", amount: "$945K", percentage: 29.5, deals: 67, avgDeal: "$14K" },
    { segment: "SMB", amount: "$455K", percentage: 14.2, deals: 156, avgDeal: "$3K" }
  ];

  const revenueByProduct = [
    { product: "Core Platform", amount: "$1.5M", percentage: 46.9, margin: "72%" },
    { product: "Analytics Suite", amount: "$823K", percentage: 25.7, margin: "68%" },
    { product: "API Access", amount: "$534K", percentage: 16.7, margin: "85%" },
    { product: "Professional Services", amount: "$343K", percentage: 10.7, margin: "45%" }
  ];

  const monthlyTrends = [
    { month: "Jan", revenue: 2.4, growth: 15 },
    { month: "Feb", revenue: 2.7, growth: 18 },
    { month: "Mar", revenue: 2.9, growth: 22 },
    { month: "Apr", revenue: 3.1, growth: 25 },
    { month: "May", revenue: 3.2, growth: 28 },
    { month: "Jun", revenue: 3.4, growth: 31 }
  ];

  const breakdownOptions = [
    { id: 'source', name: 'By Source', icon: Target },
    { id: 'segment', name: 'By Segment', icon: PieChart },
    { id: 'product', name: 'By Product', icon: BarChart3 }
  ];

  const getBreakdownData = () => {
    switch (selectedBreakdown) {
      case 'source': return revenueBySource;
      case 'segment': return revenueBySegment;
      case 'product': return revenueByProduct;
      default: return revenueBySource;
    }
  };

  const headerActions = (
    <>
      <div className="flex gap-2">
        {breakdownOptions.map(option => {
          const Icon = option.icon;
          return (
            <ModernButton
              key={option.id}
              variant={selectedBreakdown === option.id ? 'primary' : 'ghost'}
              onClick={() => setSelectedBreakdown(option.id)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {option.name}
            </ModernButton>
          );
        })}
      </div>
      <select
        value={timeFrame}
        onChange={(e) => setTimeFrame(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="yearly">Yearly</option>
      </select>
    </>
  );

  return (
    <PageWrapper
      title="Revenue Breakdown"
      description="Detailed revenue breakdown and analysis dashboard"
      onBack={onBack}
      appTheme="green"
      headerActions={headerActions}
    >
      <AIAnalysisSection
          appId="revenue-breakdown"
          analysisType="analytics"
          title="AI Revenue Breakdown Analysis"
          description="Detailed revenue breakdown and analysis dashboard."
          className="mb-8"
        />

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
          title={`Revenue ${breakdownOptions.find(b => b.id === selectedBreakdown)?.name}`}
          description="Detailed breakdown of revenue composition"
          icon={<LineChart className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            {getBreakdownData().map((item: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {item.source || item.segment || item.product}
                  </h3>
                  <div className="text-right">
                    <p className="font-bold text-xl text-green-600">{item.amount}</p>
                    <p className="text-sm text-gray-600">{item.percentage}%</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {item.growth && (
                    <div>
                      <span className="text-gray-600">Growth: </span>
                      <span className="font-medium text-green-600">{item.growth}</span>
                    </div>
                  )}
                  {item.avgDeal && (
                    <div>
                      <span className="text-gray-600">Avg Deal: </span>
                      <span className="font-medium text-gray-900">{item.avgDeal}</span>
                    </div>
                  )}
                  {item.margin && (
                    <div>
                      <span className="text-gray-600">Margin: </span>
                      <span className="font-medium text-gray-900">{item.margin}</span>
                    </div>
                  )}
                  {item.deals && (
                    <div>
                      <span className="text-gray-600">Deals: </span>
                      <span className="font-medium text-gray-900">{item.deals}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Revenue Growth Trend"
          description="Monthly revenue progression and growth rates"
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue Progression</h3>
              <div className="space-y-3">
                {monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{trend.month}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(trend.revenue / 3.4) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-900 min-w-[60px]">${trend.revenue}M</span>
                      <span className="text-sm text-green-600 min-w-[50px]">+{trend.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Best Month</h4>
                <p className="text-2xl font-bold text-green-900">June</p>
                <p className="text-green-700 text-sm">$3.4M revenue (+31% growth)</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Avg Growth</h4>
                <p className="text-2xl font-bold text-blue-900">23.2%</p>
                <p className="text-blue-700 text-sm">Consistent month-over-month</p>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Revenue Analysis & Insights"
        description="Key insights and strategic recommendations"
        icon={<Target className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Strong Performers</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Cross-sells showing 42% growth</li>
              <li>• Enterprise segment at 56% of total revenue</li>
              <li>• API Access maintains 85% margin</li>
              <li>• Recurring revenue at 66% of total</li>
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Growth Opportunities</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• SMB segment has expansion potential</li>
              <li>• Professional services margin could improve</li>
              <li>• Mid-market showing steady growth</li>
              <li>• Upsell programs driving strong results</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Strategic Actions</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Invest more in cross-sell initiatives</li>
              <li>• Develop SMB-specific offerings</li>
              <li>• Optimize service delivery margins</li>
              <li>• Focus on enterprise retention</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};