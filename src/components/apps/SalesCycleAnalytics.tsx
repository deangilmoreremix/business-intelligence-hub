import React, { useState } from 'react';
import { ArrowLeft, Clock, TrendingUp, Users, Calendar, Zap } from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { GlassCard } from '../ui/GlassCard';
import { AIChart } from '../AIChart';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface SalesCycleAnalyticsProps {
  onBack?: () => void;
}

export const SalesCycleAnalytics: React.FC<SalesCycleAnalyticsProps> = ({ onBack }) => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [timeRange, setTimeRange] = useState('90d');

  const cycleMetrics = [
    { label: "Average Cycle Time", value: "28.5 days", change: "-3.2 days", trend: "up" as const },
    { label: "Fastest Cycle Time", value: "8 days", change: "-1 day", trend: "up" as const },
    { label: "Longest Cycle Time", value: "89 days", change: "+5 days", trend: "down" as const },
    { label: "Cycle Efficiency", value: "76%", change: "+4%", trend: "up" as const }
  ];

  const stageAnalysis = [
    { stage: "Lead to Qualified", avgDays: 5.2, benchmark: 7, efficiency: 126 },
    { stage: "Qualified to Proposal", avgDays: 8.7, benchmark: 10, efficiency: 115 },
    { stage: "Proposal to Negotiation", avgDays: 12.3, benchmark: 14, efficiency: 114 },
    { stage: "Negotiation to Close", avgDays: 6.8, benchmark: 9, efficiency: 132 },
  ];

  const segmentData = {
    enterprise: { avgCycle: "45.2 days", deals: 23, efficiency: "68%" },
    midmarket: { avgCycle: "28.7 days", deals: 67, efficiency: "82%" },
    smb: { avgCycle: "12.3 days", deals: 156, efficiency: "91%" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <ModernButton variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </ModernButton>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Sales Cycle Analytics</h1>
            <p className="text-gray-600 mt-1">Track and optimize your sales cycle performance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cycleMetrics.map((metric, index) => (
            <AIChart
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              data={[28, 32, 25, 29, 27, 24, 26, 23, 25, 22, 20, 18]}
            />
          ))}
        </div>

        {/* Segment Analysis */}
        <GlassCard className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Cycle Time by Segment</h2>
            <div className="flex gap-2">
              {Object.keys(segmentData).map(segment => (
                <ModernButton
                  key={segment}
                  variant={selectedSegment === segment ? 'primary' : 'ghost'}
                  onClick={() => setSelectedSegment(segment)}
                  className="capitalize"
                  size="sm"
                >
                  {segment === 'smb' ? 'SMB' : segment}
                </ModernButton>
              ))}
              <ModernButton
                variant={selectedSegment === 'all' ? 'primary' : 'ghost'}
                onClick={() => setSelectedSegment('all')}
                size="sm"
              >
                All
              </ModernButton>
            </div>
          </div>
          
          {selectedSegment !== 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Average Cycle Time</p>
                <p className="text-3xl font-bold text-gray-900">{segmentData[selectedSegment as keyof typeof segmentData].avgCycle}</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Active Deals</p>
                <p className="text-3xl font-bold text-gray-900">{segmentData[selectedSegment as keyof typeof segmentData].deals}</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Efficiency Score</p>
                <p className="text-3xl font-bold text-gray-900">{segmentData[selectedSegment as keyof typeof segmentData].efficiency}</p>
              </div>
            </div>
          )}
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stage Analysis */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Stage Time Analysis</h2>
                <p className="text-sm text-gray-600">Average time spent in each stage</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {stageAnalysis.map((stage, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{stage.stage}</h3>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      stage.efficiency > 120 ? 'bg-green-100 text-green-800' : 
                      stage.efficiency > 100 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {stage.efficiency}% efficient
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-600">Current Avg</p>
                      <p className="font-semibold text-gray-900">{stage.avgDays} days</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Benchmark</p>
                      <p className="font-semibold text-gray-900">{stage.benchmark} days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          stage.efficiency > 120 ? 'bg-green-500' : 
                          stage.efficiency > 100 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(stage.efficiency, 150)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Team Cycle Performance */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Team Cycle Performance</h2>
                <p className="text-sm text-gray-600">Individual sales cycle metrics</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {teamMembers.map((member) => {
                const cycleTime = Math.floor(Math.random() * 20) + 15;
                const deals = Math.floor(Math.random() * 15) + 5;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        alt={member.name} fallback={member.name} 
                        status={member.status}
                        size="md"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{deals} deals this period</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{cycleTime} days</p>
                      <p className={`text-sm ${cycleTime < 25 ? 'text-green-600' : cycleTime < 35 ? 'text-blue-600' : 'text-yellow-600'}`}>
                        Avg cycle time
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* AI Insights */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Cycle Optimization</h2>
              <p className="text-sm text-gray-600">Recommendations to accelerate your sales cycle</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Quick Wins</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Automate follow-up reminders</li>
                <li>• Standardize proposal templates</li>
                <li>• Implement deal scoring</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Process Improvements</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Create qualification checklist</li>
                <li>• Optimize negotiation tactics</li>
                <li>• Reduce approval bottlenecks</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Strategic Changes</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Segment-specific playbooks</li>
                <li>• AI-powered deal insights</li>
                <li>• Predictive cycle forecasting</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};