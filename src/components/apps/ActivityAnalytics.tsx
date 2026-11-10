import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Phone, Mail, Video, Calendar, TrendingUp } from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { GlassCard } from '../ui/GlassCard';
import { AIChart } from '../AIChart';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface ActivityAnalyticsProps {
  onBack?: () => void;
}

export const ActivityAnalytics: React.FC<ActivityAnalyticsProps> = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('7d');

  const activityMetrics = [
    { label: "Total Activities", value: "2,847", change: "+12%", trend: "up" as const },
    { label: "Daily Average", value: "142", change: "+8%", trend: "up" as const },
    { label: "Response Rate", value: "78%", change: "+5%", trend: "up" as const },
    { label: "Engagement Score", value: "92", change: "+3", trend: "up" as const }
  ];

  const channelData = [
    { channel: "Email", icon: Mail, count: 1247, rate: 82, trend: "+15%" },
    { channel: "Phone", icon: Phone, count: 689, rate: 74, trend: "+8%" },
    { channel: "Video", icon: Video, count: 234, rate: 91, trend: "+22%" },
    { channel: "Meeting", icon: Calendar, count: 156, rate: 95, trend: "+12%" },
    { channel: "Chat", icon: MessageSquare, count: 521, rate: 67, trend: "+18%" }
  ];

  const frequencyAnalysis = [
    { timeSlot: "9:00 AM", activities: 45, effectiveness: 89 },
    { timeSlot: "11:00 AM", activities: 67, effectiveness: 92 },
    { timeSlot: "2:00 PM", activities: 78, effectiveness: 85 },
    { timeSlot: "4:00 PM", activities: 56, effectiveness: 88 },
    { timeSlot: "6:00 PM", activities: 23, effectiveness: 76 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <ModernButton variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </ModernButton>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Activity Analytics</h1>
            <p className="text-gray-600 mt-1">Analyze communication frequency and optimization opportunities</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* AI Analysis Section */}
        <AIAnalysisSection
          appId="activity-analytics"
          analysisType="communication"
          title="AI Activity Intelligence"
          description="AI-powered analysis of communication patterns and optimization opportunities"
          className="mb-8"
          defaultProvider="openai-fast"
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {activityMetrics.map((metric, index) => (
            <AIChart
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              data={[120, 135, 148, 162, 155, 142, 158, 167, 173, 165, 178, 184]}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Channel Performance */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Channel Performance</h2>
                <p className="text-sm text-gray-600">Activity breakdown by communication channel</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {channelData.map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{channel.channel}</h3>
                        <p className="text-sm text-gray-600">{channel.count} activities</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{channel.rate}%</p>
                      <p className="text-sm text-green-600">{channel.trend}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Time-Based Analysis */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Peak Activity Times</h2>
                <p className="text-sm text-gray-600">Optimal timing for maximum engagement</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {frequencyAnalysis.map((slot, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{slot.timeSlot}</h3>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{slot.activities}</p>
                      <p className="text-xs text-gray-600">activities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Effectiveness</span>
                        <span className="font-medium">{slot.effectiveness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${slot.effectiveness}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Team Activity Leaderboard */}
        <GlassCard className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Team Activity Leaderboard</h2>
              <p className="text-sm text-gray-600">Top performers by communication activity</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member, index) => {
              const activities = Math.floor(Math.random() * 50) + 80;
              const score = Math.floor(Math.random() * 20) + 80;
              
              return (
                <div key={member.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar 
                      alt={member.name} fallback={member.name} 
                      status={member.status}
                      size="md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      index < 2 ? 'bg-green-100 text-green-800' : 
                      index < 4 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{activities}</p>
                      <p className="text-xs text-gray-600">Activities</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{score}%</p>
                      <p className="text-xs text-gray-600">Engagement</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Activity Optimization</h2>
              <p className="text-sm text-gray-600">Recommendations to improve communication effectiveness</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Timing Optimization</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Peak engagement at 11 AM</li>
                <li>• Avoid calls after 6 PM</li>
                <li>• Tuesday-Thursday preferred</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Channel Strategy</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Video calls for high-value deals</li>
                <li>• Email for follow-ups</li>
                <li>• Phone for urgent matters</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Frequency Balance</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Maintain 3-5 touchpoints/week</li>
                <li>• Space activities 2-3 days apart</li>
                <li>• Track response fatigue</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};