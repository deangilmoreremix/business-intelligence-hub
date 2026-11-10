import React, { useState } from 'react';
import { PieChart, BarChart3, TrendingUp, Target } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface PipelineVisualizationProps {
  onBack?: () => void;
}

export const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({ onBack }) => {
  const [selectedView, setSelectedView] = useState('funnel');
  const [timeRange, setTimeRange] = useState('30d');

  const visualizationMetrics = [
    { title: "Pipeline Value", value: "$2.4M", change: 15.3, trend: "up" as const, color: "success" as const },
    { title: "Conversion Rate", value: "23.8%", change: 8.7, trend: "up" as const, color: "primary" as const },
    { title: "Velocity", value: "28 days", change: -12.5, trend: "up" as const, color: "success" as const },
    { title: "Win Rate", value: "67%", change: 5.2, trend: "up" as const, color: "success" as const }
  ];

  const stageData = [
    { stage: "Lead", count: 234, value: "$580K", conversion: 65, color: "bg-blue-500" },
    { stage: "Qualified", count: 152, value: "$760K", conversion: 78, color: "bg-green-500" },
    { stage: "Proposal", count: 89, value: "$690K", conversion: 82, color: "bg-yellow-500" },
    { stage: "Negotiation", count: 45, value: "$450K", conversion: 89, color: "bg-orange-500" },
    { stage: "Closed Won", count: 23, value: "$340K", conversion: 100, color: "bg-purple-500" }
  ];

  const segmentBreakdown = [
    { segment: "Enterprise", percentage: 45, value: "$1.1M", color: "bg-purple-500" },
    { segment: "Mid-Market", percentage: 32, value: "$770K", color: "bg-blue-500" },
    { segment: "SMB", percentage: 23, value: "$530K", color: "bg-green-500" }
  ];

  const trendData = [
    { month: "Jan", value: 1.8, deals: 67 },
    { month: "Feb", value: 2.1, deals: 73 },
    { month: "Mar", value: 1.9, deals: 69 },
    { month: "Apr", value: 2.3, deals: 81 },
    { month: "May", value: 2.4, deals: 87 },
    { month: "Jun", value: 2.2, deals: 79 }
  ];

  const viewOptions = [
    { id: 'funnel', name: 'Funnel View', icon: Target },
    { id: 'trends', name: 'Trend Analysis', icon: TrendingUp },
    { id: 'segments', name: 'Segment Breakdown', icon: PieChart }
  ];

  const headerActions = (
    <>
      <div className="flex gap-2">
        {viewOptions.map(view => {
          const Icon = view.icon;
          return (
            <ModernButton
              key={view.id}
              variant={selectedView === view.id ? 'primary' : 'ghost'}
              onClick={() => setSelectedView(view.id)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {view.name}
            </ModernButton>
          );
        })}
      </div>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
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
      title="Pipeline Visualization"
      description="Advanced pipeline charts and visual analytics"
      onBack={onBack}
      appTheme="blue"
      headerActions={headerActions}
    >
      <AIAnalysisSection
        appId="pipeline-visualization"
        analysisType="analytics"
        title="AI Pipeline Visualization Analysis"
        description="Advanced pipeline charts and visual analytics."
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {visualizationMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<PieChart className="w-6 h-6" />}
          />
        ))}
      </div>

      {selectedView === 'funnel' && (
        <Section
          title="Pipeline Funnel Analysis"
          description="Visual representation of deal progression through stages"
          icon={<Target className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-6">
            {stageData.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{stage.stage}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">{stage.count} deals</span>
                    <span className="font-semibold text-gray-900">{stage.value}</span>
                    <span className="text-green-600">{stage.conversion}% conversion</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-12 flex items-center">
                    <div 
                      className={`${stage.color} h-12 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-700`}
                      style={{ width: `${Math.max(stage.count / 234 * 100, 15)}%` }}
                    >
                      {stage.count}
                    </div>
                  </div>
                  
                  {index < stageData.length - 1 && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-400"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {selectedView === 'segments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Section
            title="Pipeline by Segment"
            description="Revenue distribution across customer segments"
            icon={<PieChart className="w-6 h-6 text-purple-600" />}
          >
            <div className="space-y-4">
              {segmentBreakdown.map((segment, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{segment.segment}</h3>
                    <span className="font-bold text-xl text-gray-900">{segment.value}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className={`${segment.color} h-6 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-700`}
                        style={{ width: `${segment.percentage}%` }}
                      >
                        {segment.percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Performance Comparison"
            description="Segment-by-segment performance analysis"
            icon={<BarChart3 className="w-6 h-6 text-green-600" />}
          >
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Best Performing</h3>
                <p className="text-blue-700 text-sm mb-2">Enterprise segment shows highest conversion at 78%</p>
                <div className="text-2xl font-bold text-blue-900">$1.1M pipeline value</div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Growth Opportunity</h3>
                <p className="text-green-700 text-sm mb-2">SMB segment showing 34% month-over-month growth</p>
                <div className="text-2xl font-bold text-green-900">23% of total pipeline</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Strategic Focus</h3>
                <p className="text-purple-700 text-sm mb-2">Mid-market balances volume and value effectively</p>
                <div className="text-2xl font-bold text-purple-900">32% market share</div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {selectedView === 'trends' && (
        <Section
          title="Pipeline Trend Analysis"
          description="Historical pipeline value and deal count trends"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Pipeline Value Trend</h3>
                <div className="space-y-3">
                  {trendData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{data.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(data.value / 2.4) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900 min-w-[60px]">${data.value}M</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Deal Count Trend</h3>
                <div className="space-y-3">
                  {trendData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{data.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(data.deals / 87) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900 min-w-[60px]">{data.deals}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Trend Insights</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Pipeline value increased 33% from January to May</li>
                <li>• Deal count showing steady growth with 30% improvement</li>
                <li>• Average deal size increased from $27K to $28K</li>
                <li>• Q2 showing strongest performance with consistent growth</li>
              </ul>
            </div>
          </div>
        </Section>
      )}
    </PageWrapper>
  );
};