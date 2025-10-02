import React, { useState } from 'react';
import { TrendingUp, BarChart3, LineChart, PieChart, Zap, Target } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';

interface TrendIntelligenceProps {
  onBack: () => void;
}

export const TrendIntelligence: React.FC<TrendIntelligenceProps> = ({ onBack }) => {
  const [selectedTrend, setSelectedTrend] = useState('revenue');
  const [forecastPeriod, setForecastPeriod] = useState('90d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const trendMetrics = [
    { title: "Trend Accuracy", value: "94.2%", change: 8.7, trend: "up" as const, color: "success" as const },
    { title: "Positive Trends", value: "23", change: 15.3, trend: "up" as const, color: "success" as const },
    { title: "Forecast Confidence", value: "89%", change: 5.2, trend: "up" as const, color: "primary" as const },
    { title: "Trend Velocity", value: "+18.5%", change: 12.8, trend: "up" as const, color: "success" as const }
  ];

  const majorTrends = [
    {
      trend: "Revenue Growth Acceleration",
      direction: "Upward",
      strength: "Strong", 
      confidence: 94,
      impact: "High",
      description: "Monthly revenue showing consistent 18% growth with accelerating trend",
      prediction: "Expected to reach $4.2M by Q4 with 95% confidence",
      recommendation: "Increase sales team capacity to capitalize on momentum"
    },
    {
      trend: "Customer Acquisition Efficiency",
      direction: "Upward",
      strength: "Moderate",
      confidence: 87,
      impact: "Medium",
      description: "Cost per acquisition decreasing while lead quality improves",
      prediction: "25% improvement in efficiency over next quarter",
      recommendation: "Scale successful acquisition channels and optimize spend"
    },
    {
      trend: "Enterprise Deal Velocity",
      direction: "Upward",
      strength: "Strong",
      confidence: 91,
      impact: "High",
      description: "Enterprise deals closing 23% faster with higher success rates",
      prediction: "Average deal time to reduce to 32 days by end of quarter",
      recommendation: "Standardize enterprise sales process and expand team"
    }
  ];

  const trendCategories = [
    { category: "Revenue Trends", count: 8, positive: 7, negative: 1, strength: "Strong" },
    { category: "Customer Trends", count: 6, positive: 5, negative: 1, strength: "Moderate" },
    { category: "Product Trends", count: 4, positive: 3, negative: 1, strength: "Moderate" },
    { category: "Market Trends", count: 5, positive: 4, negative: 1, strength: "Strong" }
  ];

  const predictiveInsights = [
    {
      insight: "Q4 Revenue Projection",
      prediction: "$4.2M",
      confidence: 94,
      timeline: "90 days",
      factors: ["Current growth rate", "Seasonal trends", "Pipeline health"]
    },
    {
      insight: "Market Expansion Opportunity",
      prediction: "35% growth potential",
      confidence: 82,
      timeline: "6 months",
      factors: ["Market analysis", "Competitor gaps", "Product readiness"]
    },
    {
      insight: "Customer Churn Risk",
      prediction: "8% decrease expected",
      confidence: 76,
      timeline: "60 days",
      factors: ["Engagement metrics", "Support quality", "Product satisfaction"]
    }
  ];

  const runTrendAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3500));
    setIsAnalyzing(false);
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'Upward': return 'text-green-600 bg-green-100';
      case 'Downward': return 'text-red-600 bg-red-100';
      case 'Stable': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong': return 'text-purple-600 bg-purple-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Weak': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <select
        value={selectedTrend}
        onChange={(e) => setSelectedTrend(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="revenue">Revenue Trends</option>
        <option value="customer">Customer Trends</option>
        <option value="market">Market Trends</option>
        <option value="product">Product Trends</option>
      </select>
      <select
        value={forecastPeriod}
        onChange={(e) => setForecastPeriod(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="30d">30 Day Forecast</option>
        <option value="90d">90 Day Forecast</option>
        <option value="180d">6 Month Forecast</option>
      </select>
      <ModernButton onClick={runTrendAnalysis} loading={isAnalyzing}>
        <Zap className="w-4 h-4" />
        Analyze Trends
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Trend Intelligence"
      description="Advanced trend analysis with predictive insights"
      onBack={onBack}
      appTheme="indigo"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isAnalyzing} 
          message="AI is analyzing trends and generating predictive insights..."
          type="brain"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {trendMetrics.map((metric, index) => (
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
        <Section
          title="Trend Categories Overview"
          description="Breakdown of trends by business area"
          icon={<PieChart className="w-6 h-6 text-indigo-600" />}
        >
          <div className="space-y-4">
            {trendCategories.map((category, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStrengthColor(category.strength)}`}>
                    {category.strength}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Total Trends</p>
                    <p className="font-semibold text-gray-900">{category.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Positive</p>
                    <p className="font-semibold text-green-600">{category.positive}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Negative</p>
                    <p className="font-semibold text-red-600">{category.negative}</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(category.positive / category.count) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Predictive Insights"
          description="AI-generated forecasts and predictions"
          icon={<Target className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {predictiveInsights.map((insight, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.insight}</h4>
                  <span className="text-lg font-bold text-blue-600">{insight.prediction}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600">Timeline: {insight.timeline}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium text-green-600">{insight.confidence}%</span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-1">Key Factors:</p>
                  <div className="flex flex-wrap gap-1">
                    {insight.factors.map((factor, factorIndex) => (
                      <span key={factorIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <LineChart className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-900">Major Trend Analysis</h2>
        </div>
        
        {majorTrends.map((trend, index) => (
          <Section key={index} className="animate-slide-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{trend.trend}</h3>
                  <p className="text-gray-600 mb-3">{trend.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${getDirectionColor(trend.direction)}`}>
                  {trend.direction}
                </div>
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStrengthColor(trend.strength)}`}>
                  {trend.strength}
                </div>
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(trend.impact)}`}>
                  {trend.impact} Impact
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">AI Prediction</h4>
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">{trend.prediction}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-24 bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${trend.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-blue-700">{trend.confidence}% confidence</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Recommended Action</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">{trend.recommendation}</p>
                </div>
              </div>
            </div>
          </Section>
        ))}
      </div>

      <Section
        title="Trend Intelligence Strategy"
        description="Strategic recommendations based on trend analysis"
        icon={<BarChart3 className="w-6 h-6 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Capitalize on Momentum</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Scale successful revenue channels</li>
              <li>• Expand enterprise sales capacity</li>
              <li>• Invest in high-performing markets</li>
              <li>• Accelerate product development</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Risk Mitigation</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Monitor customer satisfaction closely</li>
              <li>• Diversify acquisition channels</li>
              <li>• Strengthen competitive position</li>
              <li>• Build resilient processes</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Future Planning</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Develop predictive capabilities</li>
              <li>• Implement trend monitoring systems</li>
              <li>• Create scenario planning models</li>
              <li>• Build adaptive strategies</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};