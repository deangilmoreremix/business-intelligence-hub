import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, DollarSign, Clock, Zap, AlertCircle } from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { GlassCard } from '../ui/GlassCard';
import { AIChart } from '../AIChart';
import { PageWrapper } from '../layout/PageWrapper';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface PipelineIntelligenceProps {
  onBack?: () => void;
}

export const PipelineIntelligence: React.FC<PipelineIntelligenceProps> = ({ onBack }) => {
  const [aiInsights, setAIInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateAIInsights = async () => {
    setLoading(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const insights = [
      "Deals in Enterprise segment show 34% higher conversion probability",
      "Q4 pipeline velocity has increased by 23% compared to Q3",
      "Deals with 3+ stakeholders involved have 67% higher close rates",
      "Geographic analysis shows untapped potential in West Coast market",
      "AI recommends prioritizing deals worth $50K+ for maximum ROI"
    ];
    
    setAIInsights(insights);
    setLoading(false);
  };

  const pipelineData = {
    totalValue: "$2.4M",
    totalDeals: 847,
    avgDealSize: "$28,390",
    conversionRate: "23.8%",
    chartData: [65, 72, 68, 85, 92, 88, 95, 103, 97, 112, 108, 125]
  };

  const riskFactors = [
    { factor: "Stagnant Deals (>30 days)", count: 23, risk: "high" },
    { factor: "Missing Key Information", count: 45, risk: "medium" },
    { factor: "Competitor Activity", count: 12, risk: "high" },
    { factor: "Budget Concerns", count: 18, risk: "medium" }
  ];

  return (
    <PageWrapper
      title="Pipeline Intelligence"
      description="AI-powered pipeline analytics with predictive insights"
      onBack={onBack}
      appTheme="blue"
      headerActions={
        <div className="flex gap-3">
          <ModernButton onClick={generateAIInsights} loading={loading}>
            <Zap className="w-4 h-4" />
            Generate AI Insights
          </ModernButton>
        </div>
      }
    >
      {/* AI Analysis Section */}
      <AIAnalysisSection
        appId="pipeline-intelligence"
        analysisType="pipeline"
        title="AI Pipeline Analysis"
        description="Get AI-powered insights on your sales pipeline performance"
        className="mb-8"
        defaultProvider="gpt-5"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AIChart
          title="Pipeline Value"
          value={pipelineData.totalValue}
          change="+15.3%"
          trend="up"
          data={pipelineData.chartData}
        />
        <AIChart
          title="Total Deals"
          value={pipelineData.totalDeals.toString()}
          change="+8.7%"
          trend="up"
          data={[45, 52, 48, 65, 72, 68, 85, 92, 88, 95, 103, 97]}
        />
        <AIChart
          title="Avg Deal Size"
          value={pipelineData.avgDealSize}
          change="+12.1%"
          trend="up"
          data={[28, 29, 27, 31, 32, 30, 35, 38, 36, 39, 41, 43]}
        />
        <AIChart
          title="Conversion Rate"
          value={pipelineData.conversionRate}
          change="+2.4%"
          trend="up"
          data={[21, 22, 20, 23, 24, 22, 25, 26, 24, 27, 28, 26]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* AI Insights */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI-Generated Insights</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest intelligence from your pipeline data</p>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
                </div>
              ))}
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg animate-slide-in">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click "Generate AI Insights" to analyze your pipeline</p>
            </div>
          )}
        </GlassCard>

        {/* Risk Analysis */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Risk Analysis</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Potential pipeline risks and concerns</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {riskFactors.map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    risk.risk === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{risk.factor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{risk.count}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    risk.risk === 'high' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' : 
                    'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {risk.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Pipeline Stages */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Pipeline Stage Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { stage: "Lead", count: 234, value: "$580K", conversion: "45%" },
            { stage: "Qualified", count: 156, value: "$780K", conversion: "67%" },
            { stage: "Proposal", count: 89, value: "$690K", conversion: "78%" },
            { stage: "Negotiation", count: 45, value: "$450K", conversion: "82%" },
            { stage: "Closed Won", count: 23, value: "$340K", conversion: "100%" }
          ].map((stage, index) => (
            <div key={stage.stage} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{stage.stage}</h3>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stage.count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stage.value}</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: stage.conversion }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{stage.conversion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </PageWrapper>
  );
};