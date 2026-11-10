import { runAIAnalysis } from '../../lib/aiBus';
import React, { useState } from 'react';
import { Workflow, AlertTriangle, TrendingUp, Zap, Target } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';

interface WorkflowIntelligenceProps {
  onBack?: () => void;
}

export const WorkflowIntelligence: React.FC<WorkflowIntelligenceProps> = ({ onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState('sales-process');

  const workflowMetrics = [
    { title: "Workflow Efficiency", value: "84%", change: 15.2, trend: "up" as const, color: "success" as const },
    { title: "Bottlenecks Detected", value: "7", change: -23.1, trend: "up" as const, color: "success" as const },
    { title: "Avg Process Time", value: "4.2h", change: -18.5, trend: "up" as const, color: "success" as const },
    { title: "Automation Rate", value: "67%", change: 28.3, trend: "up" as const, color: "success" as const }
  ];

  const bottlenecks = [
    {
      stage: "Proposal Approval",
      delay: "2.3 days",
      impact: "High",
      frequency: 67,
      suggestion: "Implement automated approval for <$50K deals"
    },
    {
      stage: "Technical Review",
      delay: "1.8 days",
      impact: "Medium",
      frequency: 45,
      suggestion: "Add dedicated technical reviewer"
    },
    {
      stage: "Contract Generation",
      delay: "1.2 days",
      impact: "Medium",
      frequency: 89,
      suggestion: "Use template-based contract system"
    }
  ];

  const workflowSteps = [
    { step: "Lead Qualification", duration: "0.5h", efficiency: 92, status: "optimal" },
    { step: "Initial Contact", duration: "1.2h", efficiency: 78, status: "good" },
    { step: "Needs Assessment", duration: "2.1h", efficiency: 85, status: "good" },
    { step: "Proposal Creation", duration: "4.5h", efficiency: 65, status: "bottleneck" },
    { step: "Review & Approval", duration: "3.2h", efficiency: 45, status: "bottleneck" },
    { step: "Contract Finalization", duration: "2.8h", efficiency: 71, status: "needs-improvement" }
  ];

  const runWorkflowAnalysis = async () => {
    setIsAnalyzing(true);
    await runAIAnalysis('workflow-intelligence');
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'bottleneck': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <select
        value={selectedWorkflow}
        onChange={(e) => setSelectedWorkflow(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="sales-process">Sales Process</option>
        <option value="onboarding">Client Onboarding</option>
        <option value="support">Support Workflow</option>
      </select>
      <ModernButton onClick={runWorkflowAnalysis} loading={isAnalyzing}>
        <Zap className="w-4 h-4" />
        Analyze Workflow
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Workflow Intelligence"
      description="Detect bottlenecks and optimize workflow efficiency"
      onBack={onBack}
      appTheme="indigo"
      headerActions={headerActions}
    >
      <AIAnalysisSection
        appId="workflow-intelligence"
        analysisType="task"
        title="AI Workflow Intelligence Analysis"
        description="Detect bottlenecks and optimize workflow efficiency."
        className="mb-8"
      />

      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isAnalyzing} 
          message="AI is analyzing workflow patterns and bottlenecks..."
          type="brain"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {workflowMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Workflow className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Workflow Step Analysis"
          description="Efficiency breakdown by process stage"
          icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
        >
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{step.step}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(step.status)}`}>
                    {step.status.replace('-', ' ')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{step.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Efficiency</p>
                    <p className="font-semibold text-indigo-600">{step.efficiency}%</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      step.efficiency > 80 ? 'bg-green-500' :
                      step.efficiency > 70 ? 'bg-blue-500' :
                      step.efficiency > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${step.efficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Bottleneck Analysis"
          description="Identified workflow bottlenecks and solutions"
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        >
          <div className="space-y-4">
            {bottlenecks.map((bottleneck, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{bottleneck.stage}</h3>
                  <span className="text-red-600 font-medium">{bottleneck.delay} delay</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Impact Level</p>
                    <p className="font-semibold text-gray-900">{bottleneck.impact}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Frequency</p>
                    <p className="font-semibold text-gray-900">{bottleneck.frequency}%</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">AI Suggestion:</span> {bottleneck.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Workflow Optimization"
        description="Recommendations to improve process efficiency"
        icon={<Target className="w-6 h-6 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Quick Wins</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Automate proposal templates</li>
              <li>• Streamline approval process</li>
              <li>• Implement parallel reviews</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Process Improvements</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Add workflow checkpoints</li>
              <li>• Implement SLA tracking</li>
              <li>• Create escalation paths</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Long-term Strategy</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• AI-powered routing</li>
              <li>• Predictive bottleneck detection</li>
              <li>• Dynamic resource allocation</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};