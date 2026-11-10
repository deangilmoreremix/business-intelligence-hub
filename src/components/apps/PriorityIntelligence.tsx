import React, { useState } from 'react';
import { Layers, Target, AlertCircle, TrendingUp, Zap, Clock } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface PriorityIntelligenceProps {
  onBack?: () => void;
}

export const PriorityIntelligence: React.FC<PriorityIntelligenceProps> = ({ onBack }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const priorityMetrics = [
    { title: "High Priority Tasks", value: "23", change: -12.5, trend: "up" as const, color: "warning" as const },
    { title: "Optimization Score", value: "87%", change: 15.3, trend: "up" as const, color: "success" as const },
    { title: "Time Saved", value: "4.2h", change: 23.7, trend: "up" as const, color: "success" as const },
    { title: "Task Efficiency", value: "92%", change: 8.9, trend: "up" as const, color: "primary" as const }
  ];

  const priorityTasks = [
    {
      id: 1,
      title: "Follow up with TechCorp - Contract Review",
      priority: "Critical",
      aiScore: 98,
      impact: "High Revenue",
      deadline: "Today",
      estimatedTime: "1.5h",
      assignee: "Sarah Johnson"
    },
    {
      id: 2,
      title: "Prepare presentation for Global Industries",
      priority: "High",
      aiScore: 89,
      impact: "Deal Advancement",
      deadline: "Tomorrow",
      estimatedTime: "3h",
      assignee: "Michael Chen"
    },
    {
      id: 3,
      title: "Update CRM with Innovation Labs data",
      priority: "Medium",
      aiScore: 72,
      impact: "Data Quality",
      deadline: "This week",
      estimatedTime: "45m",
      assignee: "Emily Rodriguez"
    }
  ];

  const optimizePriorities = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsOptimizing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Tasks</option>
        <option value="critical">Critical Only</option>
        <option value="high">High Priority</option>
        <option value="today">Due Today</option>
      </select>
      <ModernButton onClick={optimizePriorities} loading={isOptimizing}>
        <Zap className="w-4 h-4" />
        Optimize Priorities
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Priority Intelligence"
      description="Task priority optimization using AI algorithms"
      onBack={onBack}
      appTheme="orange"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isOptimizing} 
          message="AI is optimizing task priorities based on impact and urgency..."
          type="brain"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {priorityMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Layers className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900">AI-Prioritized Task Queue</h2>
        </div>
        
        {priorityTasks.map((task) => {
          const assignedMember = teamMembers.find(m => m.name === task.assignee);
          
          return (
            <Section key={task.id} className="animate-slide-in">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedTime}
                      </span>
                      <span>Due: {task.deadline}</span>
                      <span>Impact: {task.impact}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">AI Priority Score:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${task.aiScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-orange-600">{task.aiScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {assignedMember && (
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src={assignedMember.avatar} 
                        fallback={assignedMember.initials}
                        status={assignedMember.status}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Assigned to {assignedMember.name}</p>
                        <p className="text-xs text-gray-600">{assignedMember.role}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <ModernButton variant="primary" size="sm">
                    Start Task
                  </ModernButton>
                  <ModernButton variant="outline" size="sm">
                    Reschedule
                  </ModernButton>
                  <ModernButton variant="ghost" size="sm">
                    Details
                  </ModernButton>
                </div>
              </div>
            </Section>
          );
        })}
      </div>

      <Section
        title="Priority Optimization Insights"
        description="AI recommendations for better task prioritization"
        icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Efficiency Gains</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 23% reduction in overdue tasks</li>
              <li>• 4.2 hours saved per week</li>
              <li>• 87% task completion rate</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Optimization Tips</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Focus on high-impact, urgent tasks</li>
              <li>• Batch similar activities</li>
              <li>• Delegate appropriately</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Next Actions</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Review daily priority queue</li>
              <li>• Adjust deadlines based on AI</li>
              <li>• Monitor completion patterns</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};