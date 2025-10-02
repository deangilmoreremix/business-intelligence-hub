import React, { useState } from 'react';
import { Users, TrendingDown, AlertTriangle, Target, Zap, Shield } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';

interface CompetitorInsightsProps {
  onBack: () => void;
}

export const CompetitorInsights: React.FC<CompetitorInsightsProps> = ({ onBack }) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const competitorMetrics = [
    { title: "Competitive Deals", value: "34", change: 8, trend: "down" as const, color: "warning" as const },
    { title: "Win Rate vs Competition", value: "67%", change: 12, trend: "up" as const, color: "success" as const },
    { title: "Avg Deal Size", value: "$89K", change: -5, trend: "down" as const, color: "danger" as const },
    { title: "Competitive Threat Level", value: "Medium", change: 0, trend: "up" as const, color: "warning" as const }
  ];

  const competitors = [
    { name: "CompetitorA", deals: 18, winRate: 45, avgDeal: "$75K", threat: "High" },
    { name: "CompetitorB", deals: 12, winRate: 32, avgDeal: "$65K", threat: "Medium" },
    { name: "CompetitorC", deals: 8, winRate: 28, avgDeal: "$55K", threat: "Low" }
  ];

  const runCompetitiveAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  };

  const headerActions = (
    <>
      <select
        value={selectedCompetitor}
        onChange={(e) => setSelectedCompetitor(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Competitors</option>
        {competitors.map(comp => (
          <option key={comp.name} value={comp.name}>{comp.name}</option>
        ))}
      </select>
      <ModernButton onClick={runCompetitiveAnalysis} loading={isAnalyzing}>
        <Zap className="w-4 h-4" />
        Analyze Competition
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Competitor Insights"
      description="Market intelligence and competitive analysis dashboard"
      onBack={onBack}
      appTheme="red"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isAnalyzing} 
          message="AI is analyzing competitive landscape..."
          type="brain"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {competitorMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Users className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Competitor Analysis"
          description="Head-to-head competitive performance"
          icon={<Shield className="w-6 h-6 text-red-600" />}
        >
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    competitor.threat === 'High' ? 'bg-red-100 text-red-800' :
                    competitor.threat === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {competitor.threat} Threat
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Active Deals</p>
                    <p className="font-semibold text-gray-900">{competitor.deals}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Win Rate</p>
                    <p className="font-semibold text-gray-900">{competitor.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Deal</p>
                    <p className="font-semibold text-gray-900">{competitor.avgDeal}</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${competitor.winRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Competitive Intelligence"
          description="AI-generated competitive insights"
          icon={<Target className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Market Position</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Leading in enterprise segment</li>
                <li>• Strong technical differentiation</li>
                <li>• Premium pricing strategy working</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Competitive Threats</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• CompetitorA aggressive pricing</li>
                <li>• New market entrant detected</li>
                <li>• Feature gap in mobile solution</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Opportunities</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Mid-market expansion potential</li>
                <li>• Partnership opportunities</li>
                <li>• Technology leadership advantage</li>
              </ul>
            </div>
          </div>
        </Section>
      </div>
    </PageWrapper>
  );
};