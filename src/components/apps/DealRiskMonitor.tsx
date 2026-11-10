import React, { useState } from 'react';
import { AlertTriangle, Clock, DollarSign, Shield } from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { GlassCard } from '../ui/GlassCard';
import { PageWrapper } from '../layout/PageWrapper';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface DealRiskMonitorProps {
  onBack?: () => void;
}

export const DealRiskMonitor: React.FC<DealRiskMonitorProps> = ({ onBack }) => {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');

  const riskDeals = [
    {
      id: 1,
      company: "TechCorp Solutions",
      value: "$125,000",
      probability: "45%",
      riskLevel: "high",
      riskFactors: ["No contact in 14 days", "Competitor mentioned", "Budget concerns"],
      daysInStage: 28,
      lastActivity: "2 weeks ago"
    },
    {
      id: 2,
      company: "Global Industries",
      value: "$89,500",
      probability: "62%",
      riskLevel: "medium",
      riskFactors: ["Decision maker unavailable", "Timeline pushed"],
      daysInStage: 15,
      lastActivity: "5 days ago"
    },
    {
      id: 3,
      company: "Innovation Labs",
      value: "$67,800",
      probability: "78%",
      riskLevel: "low",
      riskFactors: ["Minor technical concerns"],
      daysInStage: 8,
      lastActivity: "1 day ago"
    }
  ];

  const riskMetrics = [
    { label: "High Risk Deals", value: 23, change: "+3", color: "red" },
    { label: "Medium Risk Deals", value: 45, change: "-2", color: "yellow" },
    { label: "At Risk Revenue", value: "$1.2M", change: "+15%", color: "red" },
    { label: "Avg Days Stagnant", value: "18.5", change: "+2.3", color: "yellow" }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <PageWrapper
      title="Deal Risk Monitor"
      description="Real-time risk assessment and alerts for pipeline deals"
      onBack={onBack}
      appTheme="red"
    >
      {/* AI Analysis Section */}
      <AIAnalysisSection
        appId="deal-risk-monitor"
        analysisType="pipeline"
        title="AI Risk Assessment"
        description="AI-powered deal risk analysis and mitigation strategies"
        className="mb-8"
        defaultProvider="openai-deep"
      />

        {/* Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {riskMetrics.map((metric, index) => (
            <GlassCard key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  metric.color === 'red' ? 'bg-red-100' : 
                  metric.color === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    metric.color === 'red' ? 'text-red-600' :
                    metric.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
              </div>
              <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium inline-flex ${
                metric.change.startsWith('+') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              } dark:bg-opacity-20`}>
                {metric.change}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(level => (
              <ModernButton
                key={level}
                variant={selectedRiskLevel === level ? 'primary' : 'ghost'}
                onClick={() => setSelectedRiskLevel(level)}
                className="capitalize"
              >
                {level === 'all' ? 'All Risks' : `${level} Risk`}
              </ModernButton>
            ))}
          </div>
        </div>

        {/* Risk Deals List */}
        <div className="space-y-6">
          {riskDeals
            .filter(deal => selectedRiskLevel === 'all' || deal.riskLevel === selectedRiskLevel)
            .map(deal => (
              <GlassCard key={deal.id} className="animate-slide-in">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getRiskColor(deal.riskLevel)}`}>
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{deal.company}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {deal.value}
                        </span>
                        <span>Probability: {deal.probability}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {deal.daysInStage} days in stage
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskColor(deal.riskLevel)}`}>
                    {deal.riskLevel} Risk
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Risk Factors</h4>
                    <div className="space-y-2">
                      {deal.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">Schedule immediate follow-up call</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">Address competitor concerns</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">Provide budget justification document</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <ModernButton variant="primary" size="sm">
                    Take Action
                  </ModernButton>
                  <ModernButton variant="outline" size="sm">
                    Schedule Follow-up
                  </ModernButton>
                  <ModernButton variant="ghost" size="sm">
                    Mark as Reviewed
                  </ModernButton>
                </div>
              </GlassCard>
            ))}
        </div>
    </PageWrapper>
  );
};