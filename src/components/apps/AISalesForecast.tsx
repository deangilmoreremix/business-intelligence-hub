import { runAIAnalysis } from '../../lib/aiBus';
import React, { useState } from 'react';
import { Zap, TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';

interface AISalesForecastProps {
  onBack?: () => void;
}

export const AISalesForecast: React.FC<AISalesForecastProps> = ({ onBack }) => {
  const [forecastPeriod, setForecastPeriod] = useState('quarterly');
  const [isGenerating, setIsGenerating] = useState(false);

  const forecastMetrics = [
    { title: "Q4 Forecast", value: "$2.8M", change: 12.5, trend: "up" as const, color: "success" as const },
    { title: "Confidence Level", value: "89%", change: 5.2, trend: "up" as const, color: "primary" as const },
    { title: "Pipeline Growth", value: "+23%", change: 8.7, trend: "up" as const, color: "success" as const },
    { title: "Risk Factor", value: "Low", change: -15.3, trend: "up" as const, color: "primary" as const }
  ];

  const generateForecast = async () => {
    setIsGenerating(true);
    await runAIAnalysis('ai-sales-forecast');
    setIsGenerating(false);
  };

  const headerActions = (
    <>
      <select
        value={forecastPeriod}
        onChange={(e) => setForecastPeriod(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="yearly">Yearly</option>
      </select>
      <ModernButton onClick={generateForecast} loading={isGenerating}>
        <Zap className="w-4 h-4" />
        Generate Forecast
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="AI Sales Forecast"
      description="Predictive sales forecasting powered by machine learning"
      onBack={onBack}
      headerActions={headerActions}
    >
      <AIAnalysisSection
          appId="ai-sales-forecast"
          analysisType="pipeline"
          title="AI AI Sales Forecast Analysis"
          description="Predictive sales forecasting powered by machine learning."
          className="mb-8"
        />

      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isGenerating} 
          message="AI is generating sales forecast based on historical data..."
          type="brain"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {forecastMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<TrendingUp className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Forecast Timeline */}
        <Section
          title="Forecast Timeline"
          description="AI-predicted revenue by period"
          icon={<Calendar className="w-6 h-6 text-indigo-600" />}
        >
          <div className="space-y-4">
            {[
              { period: "Oct 2024", forecast: "$890K", confidence: 92 },
              { period: "Nov 2024", forecast: "$950K", confidence: 88 },
              { period: "Dec 2024", forecast: "$1.1M", confidence: 85 },
              { period: "Jan 2025", forecast: "$1.2M", confidence: 82 }
            ].map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{item.period}</h3>
                  <span className="text-2xl font-bold text-indigo-600">{item.forecast}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{item.confidence}% confident</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Key Factors */}
        <Section
          title="Forecast Factors"
          description="AI-identified influencing factors"
          icon={<Target className="w-6 h-6 text-purple-600" />}
        >
          <div className="space-y-4">
            {[
              { factor: "Seasonal trends", impact: "High", direction: "positive" },
              { factor: "Pipeline velocity", impact: "Medium", direction: "positive" },
              { factor: "Market conditions", impact: "Medium", direction: "neutral" },
              { factor: "Competition", impact: "Low", direction: "negative" }
            ].map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{factor.factor}</p>
                  <p className="text-sm text-gray-600">Impact: {factor.impact}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  factor.direction === 'positive' ? 'bg-green-100 text-green-800' :
                  factor.direction === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {factor.direction}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* AI Recommendations */}
      <Section
        title="AI Forecast Recommendations"
        description="Actions to improve forecast accuracy"
        icon={<BarChart3 className="w-6 h-6 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Pipeline Actions</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Accelerate Q4 negotiations</li>
              <li>• Focus on high-value prospects</li>
              <li>• Increase follow-up frequency</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Resource Planning</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Scale team for Q1 growth</li>
              <li>• Invest in top territories</li>
              <li>• Prepare for seasonal demand</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Risk Mitigation</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Monitor competitor activity</li>
              <li>• Diversify deal sizes</li>
              <li>• Strengthen partnerships</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};