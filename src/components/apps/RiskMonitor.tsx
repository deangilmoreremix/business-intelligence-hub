import React, { useState } from 'react';
import { Shield, AlertTriangle, Clock, TrendingDown, Zap, Target } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface RiskMonitorProps {
  onBack: () => void;
}

export const RiskMonitor: React.FC<RiskMonitorProps> = ({ onBack }) => {
  const [alertLevel, setAlertLevel] = useState('all');

  const riskMetrics = [
    { title: "Critical Risks", value: "12", change: -25.3, trend: "up" as const, color: "danger" as const },
    { title: "Overdue Tasks", value: "34", change: -18.7, trend: "up" as const, color: "warning" as const },
    { title: "Risk Score", value: "7.2/10", change: 12.5, trend: "down" as const, color: "warning" as const },
    { title: "Mitigation Rate", value: "78%", change: 15.2, trend: "up" as const, color: "success" as const }
  ];

  const riskCategories = [
    { type: "Deadline Risk", count: 23, severity: "High", trend: "increasing" },
    { type: "Resource Risk", count: 15, severity: "Medium", trend: "stable" },
    { type: "Quality Risk", count: 8, severity: "High", trend: "decreasing" },
    { type: "Budget Risk", count: 12, severity: "Medium", trend: "stable" }
  ];

  const criticalTasks = [
    {
      id: 1,
      title: "Enterprise Contract Review",
      assignee: "Sarah Johnson",
      deadline: "Today",
      riskLevel: "Critical",
      daysOverdue: 0,
      impact: "High Revenue Loss",
      mitigation: "Expedite legal review process"
    },
    {
      id: 2,
      title: "Technical Implementation",
      assignee: "Michael Chen",
      deadline: "Tomorrow",
      riskLevel: "High",
      daysOverdue: 0,
      impact: "Client Satisfaction",
      mitigation: "Allocate additional resources"
    },
    {
      id: 3,
      title: "Quarterly Business Review",
      assignee: "Emily Rodriguez",
      deadline: "2 days ago",
      riskLevel: "Critical",
      daysOverdue: 2,
      impact: "Client Relationship",
      mitigation: "Schedule emergency meeting"
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <PageWrapper
      title="Risk Monitor"
      description="Deadline risk assessment and mitigation strategies"
      onBack={onBack}
      appTheme="red"
      headerActions={
        <select
          value={alertLevel}
          onChange={(e) => setAlertLevel(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Risks</option>
          <option value="critical">Critical Only</option>
          <option value="overdue">Overdue Tasks</option>
        </select>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {riskMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Shield className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Risk Categories"
          description="Breakdown of risk types and severity levels"
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        >
          <div className="space-y-4">
            {riskCategories.map((category, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{category.type}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getSeverityColor(category.severity)}`}>
                      {category.severity}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">{category.count}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Trend: {category.trend}</span>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    category.trend === 'increasing' ? 'bg-red-100 text-red-800' :
                    category.trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {category.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Team Risk Overview"
          description="Individual risk exposure and workload"
          icon={<TrendingDown className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            {teamMembers.slice(0, 5).map((member, index) => {
              const riskTasks = Math.floor(Math.random() * 8) + 2;
              const riskScore = Math.floor(Math.random() * 40) + 30;
              
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
                      <p className="text-sm text-gray-600">{riskTasks} at-risk tasks</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      riskScore > 60 ? 'text-red-600' : 
                      riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {riskScore}%
                    </p>
                    <p className="text-sm text-gray-600">Risk level</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Critical Tasks Requiring Attention</h2>
        </div>
        
        {criticalTasks.map((task, index) => {
          const assignedMember = teamMembers.find(m => m.name === task.assignee);
          
          return (
            <Section key={task.id} className="animate-slide-in">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Due: {task.deadline}
                      </span>
                      {task.daysOverdue > 0 && (
                        <span className="text-red-600 font-medium">
                          {task.daysOverdue} days overdue
                        </span>
                      )}
                      <span>Impact: {task.impact}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(task.riskLevel)}`}>
                  {task.riskLevel} Risk
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {assignedMember && (
                    <div className="flex items-center gap-3 mb-4">
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

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Mitigation Strategy:</span> {task.mitigation}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ModernButton variant="primary" size="sm">
                    Take Action
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
        title="Risk Mitigation Strategies"
        description="Proactive approaches to minimize project risks"
        icon={<Target className="w-6 h-6 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">High Priority</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Address overdue tasks immediately</li>
              <li>• Implement daily stand-ups</li>
              <li>• Set up automated alerts</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Medium Priority</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Review resource allocation</li>
              <li>• Establish backup plans</li>
              <li>• Monitor quality metrics</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Long-term Prevention</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Predictive risk modeling</li>
              <li>• Team training programs</li>
              <li>• Process optimization</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};