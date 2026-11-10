import React, { useState } from 'react';
import { Zap, Play, Pause, Settings, TrendingUp } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface AutomationHubProps {
  onBack?: () => void;
}

export const AutomationHub: React.FC<AutomationHubProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const automationMetrics = [
    { title: "Active Automations", value: "42", change: 18.7, trend: "up" as const, color: "success" as const },
    { title: "Time Saved", value: "127h", change: 34.2, trend: "up" as const, color: "success" as const },
    { title: "Tasks Automated", value: "2,847", change: 23.1, trend: "up" as const, color: "primary" as const },
    { title: "Success Rate", value: "96.8%", change: 8.3, trend: "up" as const, color: "success" as const }
  ];

  const automations = [
    {
      name: "Lead Qualification Workflow",
      category: "Sales",
      status: "Active",
      frequency: "Real-time",
      timeSaved: "15h/week",
      success: 94,
      lastRun: "2 min ago"
    },
    {
      name: "Follow-up Email Sequence", 
      category: "Marketing",
      status: "Active",
      frequency: "Daily",
      timeSaved: "8h/week",
      success: 89,
      lastRun: "1 hour ago"
    },
    {
      name: "Deal Stage Updates",
      category: "Sales",
      status: "Paused",
      frequency: "Hourly",
      timeSaved: "12h/week",
      success: 97,
      lastRun: "3 hours ago"
    },
    {
      name: "Report Generation",
      category: "Analytics",
      status: "Active", 
      frequency: "Weekly",
      timeSaved: "6h/week",
      success: 100,
      lastRun: "Yesterday"
    }
  ];

  const opportunities = [
    {
      process: "Contract Approval Workflow",
      timeSpent: "24h/week",
      complexity: "Medium",
      potential: "High",
      effort: "Low"
    },
    {
      process: "Data Entry Automation",
      timeSpent: "18h/week", 
      complexity: "Low",
      potential: "High",
      effort: "Low"
    },
    {
      process: "Customer Onboarding",
      timeSpent: "32h/week",
      complexity: "High",
      potential: "Medium", 
      effort: "High"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Paused': return 'text-yellow-600 bg-yellow-100';
      case 'Error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <PageWrapper
      title="Smart Automation Hub"
      description="Identify and implement automation opportunities"
      onBack={onBack}
      appTheme="purple"
      headerActions={
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
      <AIAnalysisSection
          appId="automation-hub"
          analysisType="integration"
          title="AI Smart Automation Hub Analysis"
          description="Identify and implement automation opportunities."
          className="mb-8"
        />

          <option value="all">All Categories</option>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
          <option value="analytics">Analytics</option>
        </select>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {automationMetrics.map((metric, index) => (
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
          title="Active Automations"
          description="Currently running automation workflows"
          icon={<Play className="w-6 h-6 text-purple-600" />}
        >
          <div className="space-y-4">
            {automations
              .filter(automation => selectedCategory === 'all' || automation.category.toLowerCase() === selectedCategory)
              .map((automation, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                    <p className="text-sm text-gray-600">{automation.category} • {automation.frequency}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(automation.status)}`}>
                      {automation.status}
                    </div>
                    {automation.status === 'Active' ? (
                      <ModernButton variant="outline" size="sm">
                        <Pause className="w-3 h-3" />
                      </ModernButton>
                    ) : (
                      <ModernButton variant="outline" size="sm">
                        <Play className="w-3 h-3" />
                      </ModernButton>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Time Saved</p>
                    <p className="font-semibold text-purple-600">{automation.timeSaved}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Success Rate</p>
                    <p className="font-semibold text-gray-900">{automation.success}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Run</p>
                    <p className="font-semibold text-gray-900">{automation.lastRun}</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${automation.success}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Automation Opportunities"
          description="Processes identified for automation"
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            {opportunities.map((opportunity, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{opportunity.process}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getPotentialColor(opportunity.potential)}`}>
                    {opportunity.potential} Impact
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Time Spent</p>
                    <p className="font-semibold text-red-600">{opportunity.timeSpent}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Complexity</p>
                    <p className="font-semibold text-gray-900">{opportunity.complexity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Effort</p>
                    <p className="font-semibold text-gray-900">{opportunity.effort}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <ModernButton variant="primary" size="sm">
                    Create Automation
                  </ModernButton>
                  <ModernButton variant="outline" size="sm">
                    Analyze Process
                  </ModernButton>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Automation Strategy"
        description="Best practices and implementation guidance"
        icon={<Settings className="w-6 h-6 text-blue-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Quick Wins</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Automate repetitive data entry</li>
              <li>• Set up email notifications</li>
              <li>• Create approval workflows</li>
              <li>• Schedule regular reports</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Medium-term Goals</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Complex workflow automation</li>
              <li>• AI-powered decision making</li>
              <li>• Cross-platform integration</li>
              <li>• Advanced trigger conditions</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Best Practices</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Start with simple processes</li>
              <li>• Monitor automation performance</li>
              <li>• Include fallback mechanisms</li>
              <li>• Regular review and optimization</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};