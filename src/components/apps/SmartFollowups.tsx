import { runAIAnalysis } from '../../lib/aiBus';
import React, { useState } from 'react';
import { ArrowLeft, CheckSquare, AlertCircle, Zap, Calendar, Target } from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { GlassCard } from '../ui/GlassCard';
import { AIChart } from '../AIChart';
import { Avatar } from '../ui/Avatar';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';
import { teamMembers } from '../../data/teamMembers';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface SmartFollowupsProps {
  onBack?: () => void;
}

export const SmartFollowups: React.FC<SmartFollowupsProps> = ({ onBack }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('all');

  const followupMetrics = [
    { label: "Pending Follow-ups", value: "247", change: "-8%", trend: "up" as const },
    { label: "Completion Rate", value: "84%", change: "+6%", trend: "up" as const },
    { label: "Avg Response Time", value: "2.3h", change: "-45m", trend: "up" as const },
    { label: "Success Rate", value: "67%", change: "+12%", trend: "up" as const }
  ];

  const smartFollowups = [
    {
      id: 1,
      contact: "Acme Corporation",
      assignee: "Sarah Johnson",
      type: "Proposal Follow-up",
      priority: "high",
      scheduledFor: "Today, 2:00 PM",
      reason: "Proposal sent 3 days ago, optimal follow-up time",
      aiSuggestion: "Send personalized video message addressing specific concerns mentioned in last call",
      dealValue: "$125K",
      lastActivity: "3 days ago"
    },
    {
      id: 2,
      contact: "Tech Solutions Inc",
      assignee: "Michael Chen",
      type: "Demo Recap",
      priority: "medium",
      scheduledFor: "Tomorrow, 10:00 AM",
      reason: "Demo completed, high engagement detected",
      aiSuggestion: "Share relevant case study and pricing options based on demo interests",
      dealValue: "$87K",
      lastActivity: "1 day ago"
    },
    {
      id: 3,
      contact: "Global Enterprises",
      assignee: "Emily Rodriguez",
      type: "Decision Maker Contact",
      priority: "high",
      scheduledFor: "Today, 4:30 PM",
      reason: "Primary contact showed interest, need to reach decision maker",
      aiSuggestion: "Request introduction to decision maker with value proposition summary",
      dealValue: "$340K",
      lastActivity: "5 days ago"
    }
  ];

  const optimizeFollowups = async () => {
    setIsOptimizing(true);
    await runAIAnalysis('smart-followups');
    setIsOptimizing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <ModernButton variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </ModernButton>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Smart Follow-ups</h1>
            <p className="text-gray-600 mt-1">AI-powered follow-up reminders and optimization</p>
          </div>
          <div className="flex gap-3">
            <ModernButton onClick={optimizeFollowups} loading={isOptimizing}>
              <Zap className="w-4 h-4" />
              Optimize Schedule
            </ModernButton>
          </div>
        </div>

        {/* AI Analysis Section */}
        <AIAnalysisSection
          appId="smart-followups"
          analysisType="task"
          title="AI Follow-up Optimization"
          description="Get AI recommendations for follow-up timing and content optimization"
          className="mb-8"
          defaultProvider="openai-deep"
        />

        {/* AI Processing */}
        <div className="mb-6">
          <AIProcessingIndicator 
            isProcessing={isOptimizing} 
            message="AI is optimizing your follow-up schedule..."
            type="zap"
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {followupMetrics.map((metric, index) => (
            <AIChart
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              data={[247, 235, 252, 248, 239, 231, 245, 238, 242, 236, 229, 224]}
            />
          ))}
        </div>

        {/* Filter Controls */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(priority => (
              <ModernButton
                key={priority}
                variant={selectedPriority === priority ? 'primary' : 'ghost'}
                onClick={() => setSelectedPriority(priority)}
                className="capitalize"
                size="sm"
              >
                {priority === 'all' ? 'All Priorities' : `${priority} Priority`}
              </ModernButton>
            ))}
          </div>
        </div>

        {/* Smart Follow-up Queue */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Smart Follow-up Queue</h2>
          </div>
          
          {smartFollowups
            .filter(followup => selectedPriority === 'all' || followup.priority === selectedPriority)
            .map((followup) => {
              const assignedMember = teamMembers.find(m => m.name === followup.assignee);
              
              return (
                <GlassCard key={followup.id} className="animate-slide-in">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Target className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{followup.contact}</h3>
                        <p className="text-gray-600 mt-1">{followup.type}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {followup.scheduledFor}
                          </span>
                          <span>Deal value: {followup.dealValue}</span>
                          <span>Last activity: {followup.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPriorityColor(followup.priority)}`}>
                      {followup.priority} Priority
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Why Follow-up Now?</h4>
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-blue-700">{followup.reason}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Suggestion</h4>
                      <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                        <Zap className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-purple-700">{followup.aiSuggestion}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {assignedMember && (
                        <>
                          <Avatar 
                            alt={assignedMember.name} fallback={assignedMember.name} 
                            status={assignedMember.status}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Assigned to {assignedMember.name}</p>
                            <p className="text-xs text-gray-600">{assignedMember.role}</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <ModernButton variant="outline" size="sm">
                        Reschedule
                      </ModernButton>
                      <ModernButton variant="primary" size="sm">
                        Execute Follow-up
                      </ModernButton>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
        </div>

        {/* Follow-up Performance by Team */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Team Follow-up Performance</h2>
              <p className="text-sm text-gray-600">Individual follow-up completion rates and effectiveness</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => {
              const completionRate = Math.floor(Math.random() * 20) + 75;
              const responseRate = Math.floor(Math.random() * 25) + 65;
              const pending = Math.floor(Math.random() * 15) + 5;
              
              return (
                <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar 
                      alt={member.name} fallback={member.name} 
                      status={member.status}
                      size="md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{pending} pending</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-medium">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Response Rate</span>
                        <span className="font-medium">{responseRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${responseRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>

  );
};