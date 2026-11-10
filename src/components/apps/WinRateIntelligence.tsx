import React, { useState } from 'react';
import { Award, TrendingUp, Users, Target, Zap, BarChart3 } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { Avatar } from '../ui/Avatar';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';
import { teamMembers } from '../../data/teamMembers';

interface WinRateIntelligenceProps {
  onBack?: () => void;
}

export const WinRateIntelligence: React.FC<WinRateIntelligenceProps> = ({ onBack }) => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const winRateMetrics = [
    { title: "Overall Win Rate", value: "67.3%", change: 5.2, trend: "up" as const, color: "success" as const },
    { title: "Avg Deal Cycle", value: "28 days", change: -3.5, trend: "up" as const, color: "primary" as const },
    { title: "Top Performer", value: "Sarah J.", change: 12.8, trend: "up" as const, color: "primary" as const },
    { title: "Win Rate Trend", value: "↗ +8.4%", change: 8.4, trend: "up" as const, color: "success" as const }
  ];

  const segmentAnalysis = [
    { segment: "Enterprise", winRate: 78, deals: 45, revenue: "$1.2M", trend: "up" },
    { segment: "Mid-Market", winRate: 65, deals: 89, revenue: "$890K", trend: "up" },
    { segment: "SMB", winRate: 52, deals: 156, revenue: "$340K", trend: "down" }
  ];

  const runWinRateAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  };

  const headerActions = (
    <>
      <select
        value={selectedSegment}
        onChange={(e) => setSelectedSegment(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Segments</option>
        <option value="enterprise">Enterprise</option>
        <option value="midmarket">Mid-Market</option>
        <option value="smb">SMB</option>
      </select>
      <ModernButton onClick={runWinRateAnalysis} loading={isAnalyzing}>
        <Zap className="w-4 h-4" />
        Analyze Win Rates
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Win Rate Intelligence"
      description="Advanced win rate analysis and optimization insights"
      onBack={onBack}
      headerActions={headerActions}
    >
      {/* AI Processing Indicator */}
      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isAnalyzing} 
          message="AI is analyzing win rate patterns and success factors..."
          type="brain"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {winRateMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Award className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Segment Performance */}
        <Section
          title="Win Rate by Segment"
          description="Performance breakdown across customer segments"
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {segmentAnalysis.map((segment, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{segment.segment}</h3>
                  <div className={`flex items-center gap-1 ${segment.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{segment.winRate}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Win Rate</p>
                    <p className="font-semibold text-gray-900">{segment.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Deals</p>
                    <p className="font-semibold text-gray-900">{segment.deals}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-semibold text-gray-900">{segment.revenue}</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${segment.winRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Team Win Rates */}
        <Section
          title="Team Performance"
          description="Individual contributor win rate analysis"
          icon={<Users className="w-6 h-6 text-purple-600" />}
        >
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const winRate = Math.floor(Math.random() * 30) + 55;
              const deals = Math.floor(Math.random() * 20) + 10;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={member.avatar} 
                      fallback={member.initials}
                      status={member.status}
                      size="md"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{deals} deals</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-2xl text-gray-900">{winRate}%</p>
                    <p className={`text-sm ${winRate > 65 ? 'text-green-600' : 'text-yellow-600'}`}>
                      Win Rate
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* AI Insights */}
      <Section
        title="AI Win Rate Optimization"
        description="Recommendations to improve conversion rates"
        icon={<Target className="w-6 h-6 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Top Success Factors</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Quick response times (&lt;2 hours)</li>
              <li>• Multiple stakeholder meetings</li>
              <li>• Personalized proposals</li>
              <li>• Technical demos included</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Process Improvements</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Standardize qualification criteria</li>
              <li>• Implement deal scoring system</li>
              <li>• Improve competitor analysis</li>
              <li>• Enhanced objection handling</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Strategic Focus</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Target enterprise segment</li>
              <li>• Invest in team training</li>
              <li>• Optimize pricing strategy</li>
              <li>• Enhance value proposition</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};