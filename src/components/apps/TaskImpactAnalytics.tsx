import React, { useState } from 'react';
import { Activity, Target, BarChart3, Zap } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';

interface TaskImpactAnalyticsProps {
  onBack?: () => void;
}

export const TaskImpactAnalytics: React.FC<TaskImpactAnalyticsProps> = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('30d');

  const impactMetrics = [
    { title: "High Impact Tasks", value: "156", change: 23.4, trend: "up" as const, color: "success" as const },
    { title: "Productivity Score", value: "87%", change: 12.1, trend: "up" as const, color: "primary" as const },
    { title: "Value Generated", value: "$1.2M", change: 18.7, trend: "up" as const, color: "success" as const },
    { title: "Efficiency Gain", value: "+34%", change: 8.9, trend: "up" as const, color: "success" as const }
  ];

  const taskCategories = [
    { category: "Deal Advancement", impact: 92, tasks: 45, value: "$450K" },
    { category: "Client Communication", impact: 78, tasks: 89, value: "$230K" },
    { category: "Proposal Creation", impact: 85, tasks: 32, value: "$320K" },
    { category: "Follow-up Activities", impact: 71, tasks: 67, value: "$180K" }
  ];

  const impactAnalysis = [
    {
      task: "Enterprise Deal Negotiations",
      impact: 95,
      frequency: 12,
      timeSpent: "18h",
      revenue: "$340K",
      status: "high-impact"
    },
    {
      task: "Technical Presentations",
      impact: 87,
      frequency: 23,
      timeSpent: "34h",
      revenue: "$280K",
      status: "high-impact"
    },
    {
      task: "Proposal Reviews",
      impact: 72,
      frequency: 45,
      timeSpent: "28h",
      revenue: "$150K",
      status: "medium-impact"
    }
  ];

  const getImpactColor = (impact: number) => {
    if (impact >= 85) return 'text-green-600 bg-green-100';
    if (impact >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <PageWrapper
      title="Task Impact Analytics"
      description="Measure and analyze the impact of your activities"
      onBack={onBack}
      appTheme="purple"
      headerActions={
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {impactMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Activity className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Task Categories by Impact"
          description="Performance breakdown by activity type"
          icon={<Target className="w-6 h-6 text-purple-600" />}
        >
          <div className="space-y-4">
            {taskCategories.map((category, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(category.impact)}`}>
                    {category.impact}% Impact
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Tasks</p>
                    <p className="font-semibold text-gray-900">{category.tasks}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Value</p>
                    <p className="font-semibold text-gray-900">{category.value}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Impact Score</p>
                    <p className="font-semibold text-purple-600">{category.impact}%</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.impact}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="High-Impact Task Analysis"
          description="Detailed breakdown of most valuable activities"
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {impactAnalysis.map((task, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{task.task}</h3>
                  <span className="text-green-600 font-medium">{task.revenue}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <span className="ml-1 font-medium">{task.frequency}x</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-1 font-medium">{task.timeSpent}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Impact:</span>
                    <span className="ml-1 font-medium">{task.impact}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${task.impact}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Impact Optimization"
        description="Recommendations to maximize task effectiveness"
        icon={<Zap className="w-6 h-6 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">High-Impact Focus</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Prioritize enterprise negotiations</li>
              <li>• Increase technical presentation frequency</li>
              <li>• Allocate more time to deal advancement</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Efficiency Improvements</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Automate low-impact tasks</li>
              <li>• Delegate routine activities</li>
              <li>• Streamline proposal processes</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Time Allocation</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 60% time on high-impact tasks</li>
              <li>• 30% on medium-impact activities</li>
              <li>• 10% on maintenance tasks</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};