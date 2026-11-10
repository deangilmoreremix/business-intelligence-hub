import { runAIAnalysis } from '../../lib/aiBus';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, Target, Users } from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import { GlassCard } from '../ui/GlassCard';
import { AIChart } from '../AIChart';
import { Avatar } from '../ui/Avatar';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';
import { teamMembers } from '../../data/teamMembers';

interface PipelineHealthDashboardProps {
  onBack?: () => void;
}

export const PipelineHealthDashboard: React.FC<PipelineHealthDashboardProps> = ({ onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [healthScore, setHealthScore] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    // Animate health score on load
    setTimeout(() => setHealthScore(87), 500);
  }, []);

  const runHealthAnalysis = async () => {
    setIsAnalyzing(true);
    const aiResult = await runAIAnalysis('pipeline-health');
    if (aiResult) setHealthScore(Math.round(aiResult.confidence));
    setIsAnalyzing(false);
  };

  const healthMetrics = [
    { label: "Overall Health Score", value: `${healthScore}%`, change: "+3%", trend: "up" as const },
    { label: "Pipeline Velocity", value: "23.5 days", change: "-2.1 days", trend: "up" as const },
    { label: "Conversion Rate", value: "18.7%", change: "+1.4%", trend: "up" as const },
    { label: "Revenue at Risk", value: "$245K", change: "-15%", trend: "up" as const }
  ];

  const stageHealth = [
    { stage: "Lead", health: 92, deals: 156, value: "$780K", issues: 2 },
    { stage: "Qualified", health: 87, deals: 89, value: "$890K", issues: 5 },
    { stage: "Proposal", health: 74, deals: 45, value: "$670K", issues: 8 },
    { stage: "Negotiation", health: 68, deals: 23, value: "$450K", issues: 12 },
    { stage: "Closing", health: 85, deals: 15, value: "$340K", issues: 3 }
  ];

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600 bg-green-100';
    if (health >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <ModernButton variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </ModernButton>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Pipeline Health Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive health analysis of your sales pipeline</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <ModernButton onClick={runHealthAnalysis} loading={isAnalyzing}>
              <Target className="w-4 h-4" />
              Analyze Health
            </ModernButton>
          </div>
        </div>
        <AIAnalysisSection
          appId="pipeline-health"
          analysisType="pipeline"
          title="AI Pipeline Health Dashboard Analysis"
          description="Comprehensive health analysis of your sales pipeline."
          className="mb-8"
        />


        {/* AI Processing */}
        <div className="mb-6">
          <AIProcessingIndicator 
            isProcessing={isAnalyzing} 
            message="AI is analyzing pipeline health patterns..."
            type="brain"
          />
        </div>

        {/* Health Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthMetrics.map((metric, index) => (
            <AIChart
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              data={[65, 72, 68, 85, 92, 88, 95, 103, 97, 112, 108, 125]}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stage Health Breakdown */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Stage Health Analysis</h2>
                <p className="text-sm text-gray-600">Health metrics by pipeline stage</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {stageHealth.map((stage, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{stage.stage}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(stage.health)}`}>
                        {stage.health}% Healthy
                      </span>
                    </div>
                    {stage.issues > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">{stage.issues} issues</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Deals</p>
                      <p className="font-semibold text-gray-900">{stage.deals}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Value</p>
                      <p className="font-semibold text-gray-900">{stage.value}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Health</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-700 ${
                            stage.health >= 80 ? 'bg-green-500' : 
                            stage.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${stage.health}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Team Performance */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Team Health Score</h2>
                <p className="text-sm text-gray-600">Individual contributor pipeline health</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      alt={member.name} fallback={member.name} 
                      status={member.status}
                      size="md"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{member.deals} deals</p>
                      <p className="text-sm text-gray-600">{member.revenue}</p>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(member.performance || 85)}`}>
                      {member.performance || 85}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Health Recommendations */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Health Recommendations</h2>
              <p className="text-sm text-gray-600">Actionable insights to improve pipeline health</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Critical Issues</h3>
              {[
                "12 deals stuck in negotiation stage for >30 days",
                "Proposal stage conversion rate dropped 3.2%",
                "3 high-value deals showing competitor activity"
              ].map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{issue}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Recommendations</h3>
              {[
                "Schedule follow-up calls for stagnant negotiation deals",
                "Review and optimize proposal templates",
                "Implement competitive battle cards for at-risk deals"
              ].map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};