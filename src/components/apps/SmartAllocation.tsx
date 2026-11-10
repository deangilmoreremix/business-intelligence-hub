import React, { useState } from 'react';
import { Calendar, Users, Target, Zap, BarChart3 } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { Avatar } from '../ui/Avatar';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';
import { teamMembers } from '../../data/teamMembers';

interface SmartAllocationProps {
  onBack?: () => void;
}

export const SmartAllocation: React.FC<SmartAllocationProps> = ({ onBack }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedView, setSelectedView] = useState('team');

  const allocationMetrics = [
    { title: "Utilization Rate", value: "87%", change: 12.3, trend: "up" as const, color: "success" as const },
    { title: "Efficiency Score", value: "92%", change: 8.7, trend: "up" as const, color: "primary" as const },
    { title: "Optimal Matches", value: "156", change: 23.4, trend: "up" as const, color: "success" as const },
    { title: "Resource Balance", value: "94%", change: 15.6, trend: "up" as const, color: "success" as const }
  ];

  const teamAllocation = teamMembers.map(member => ({
    ...member,
    utilization: Math.floor(Math.random() * 30) + 70,
    skills: ['Sales', 'Technical', 'Project Management'].slice(0, Math.floor(Math.random() * 3) + 1),
    currentProjects: Math.floor(Math.random() * 5) + 2,
    capacity: Math.floor(Math.random() * 20) + 20
  }));

  const projectAllocations = [
    {
      project: "Enterprise Client Onboarding",
      priority: "High",
      requiredSkills: ["Technical", "Project Management"],
      allocatedTeam: ["Sarah Johnson", "Michael Chen"],
      completion: 78,
      deadline: "Next week"
    },
    {
      project: "Product Demo Preparation",
      priority: "Medium",
      requiredSkills: ["Sales", "Technical"],
      allocatedTeam: ["Emily Rodriguez"],
      completion: 45,
      deadline: "2 weeks"
    },
    {
      project: "Quarterly Business Review",
      priority: "High",
      requiredSkills: ["Sales", "Analytics"],
      allocatedTeam: ["David Kim", "Lisa Thompson"],
      completion: 23,
      deadline: "This month"
    }
  ];

  const optimizeAllocation = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsOptimizing(false);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 95) return 'text-red-600 bg-red-100';
    if (utilization > 85) return 'text-green-600 bg-green-100';
    if (utilization > 70) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <div className="flex gap-2">
        {['team', 'projects'].map(view => (
          <ModernButton
            key={view}
            variant={selectedView === view ? 'primary' : 'ghost'}
            onClick={() => setSelectedView(view)}
            className="capitalize"
            size="sm"
          >
            {view}
          </ModernButton>
        ))}
      </div>
      <ModernButton onClick={optimizeAllocation} loading={isOptimizing}>
        <Zap className="w-4 h-4" />
        Optimize Allocation
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Smart Allocation"
      description="AI-driven resource allocation and optimization"
      onBack={onBack}
      appTheme="teal"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isOptimizing} 
          message="AI is optimizing resource allocation based on skills and capacity..."
          type="brain"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {allocationMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Calendar className="w-6 h-6" />}
          />
        ))}
      </div>

      {selectedView === 'team' ? (
        <Section
          title="Team Resource Allocation"
          description="Current utilization and capacity planning"
          icon={<Users className="w-6 h-6 text-teal-600" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {teamAllocation.map((member) => (
              <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar 
                    src={member.avatar} 
                    fallback={member.initials}
                    status={member.status}
                    size="md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getUtilizationColor(member.utilization)}`}>
                    {member.utilization}%
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Capacity Utilization</span>
                      <span className="font-medium">{member.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          member.utilization > 95 ? 'bg-red-500' :
                          member.utilization > 85 ? 'bg-green-500' :
                          member.utilization > 70 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${member.utilization}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Projects</p>
                      <p className="font-semibold text-gray-900">{member.currentProjects}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Available Hours</p>
                      <p className="font-semibold text-gray-900">{member.capacity}h</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Skills</p>
                    <div className="flex gap-1 flex-wrap">
                      {member.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : (
        <Section
          title="Project Allocations"
          description="Current project assignments and resource distribution"
          icon={<Target className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-6">
            {projectAllocations.map((project, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.project}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Deadline: {project.deadline}</span>
                      <span>Required: {project.requiredSkills.join(', ')}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority} Priority
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Assigned Team</h4>
                    <div className="space-y-2">
                      {project.allocatedTeam.map((memberName, memberIndex) => {
                        const member = teamMembers.find(m => m.name === memberName);
                        return member ? (
                          <div key={memberIndex} className="flex items-center gap-3">
                            <Avatar 
                              src={member.avatar} 
                              fallback={member.initials}
                              status={member.status}
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-600">{member.role}</p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Progress</h4>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Completion</span>
                        <span className="font-medium">{project.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-teal-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${project.completion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section
        title="Allocation Optimization"
        description="AI recommendations for better resource utilization"
        icon={<BarChart3 className="w-6 h-6 text-green-600" />}
        className="mt-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Capacity Optimization</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Rebalance overutilized resources</li>
              <li>• Identify skill gaps in projects</li>
              <li>• Cross-train team members</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Efficiency Gains</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Match skills to project needs</li>
              <li>• Minimize context switching</li>
              <li>• Optimize project timelines</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Strategic Planning</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Forecast resource needs</li>
              <li>• Plan for skill development</li>
              <li>• Implement dynamic allocation</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};