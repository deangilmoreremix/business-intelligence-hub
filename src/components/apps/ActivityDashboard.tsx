import React, { useState } from 'react';
import { Activity, Users, Clock, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface ActivityDashboardProps {
  onBack: () => void;
}

export const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('today');
  const [activityType, setActivityType] = useState('all');

  const activityMetrics = [
    { title: "Total Activities", value: "2,847", change: 18.5, trend: "up" as const, color: "primary" as const },
    { title: "Team Productivity", value: "94%", change: 12.3, trend: "up" as const, color: "success" as const },
    { title: "Avg Response Time", value: "2.3h", change: -23.7, trend: "up" as const, color: "success" as const },
    { title: "Completion Rate", value: "87%", change: 8.9, trend: "up" as const, color: "success" as const }
  ];

  const activityTypes = [
    { type: "Calls", count: 456, percentage: 35, avgDuration: "12.5 min", success: 89 },
    { type: "Emails", count: 892, percentage: 28, avgDuration: "3.2 min", success: 76 },
    { type: "Meetings", count: 234, percentage: 18, avgDuration: "45 min", success: 94 },
    { type: "Tasks", count: 567, percentage: 19, avgDuration: "25 min", success: 82 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "Call",
      title: "Follow-up call with TechCorp",
      user: "Sarah Johnson",
      time: "5 minutes ago",
      duration: "15 min",
      status: "completed",
      outcome: "Positive - scheduled demo"
    },
    {
      id: 2,
      type: "Email",
      title: "Proposal sent to Global Industries",
      user: "Michael Chen",
      time: "12 minutes ago",
      duration: "2 min",
      status: "sent",
      outcome: "Awaiting response"
    },
    {
      id: 3,
      type: "Meeting",
      title: "Product demo with Innovation Labs",
      user: "Emily Rodriguez",
      time: "1 hour ago",
      duration: "60 min",
      status: "completed",
      outcome: "Very interested - next step: pricing"
    },
    {
      id: 4,
      type: "Task",
      title: "Contract review and updates",
      user: "David Kim",
      time: "2 hours ago", 
      duration: "30 min",
      status: "completed",
      outcome: "Ready for signature"
    }
  ];

  const hourlyActivity = [
    { hour: "9 AM", activities: 145, productivity: 78 },
    { hour: "10 AM", activities: 189, productivity: 89 },
    { hour: "11 AM", activities: 234, productivity: 92 },
    { hour: "12 PM", activities: 156, productivity: 71 },
    { hour: "1 PM", activities: 123, productivity: 65 },
    { hour: "2 PM", activities: 198, productivity: 88 },
    { hour: "3 PM", activities: 212, productivity: 91 },
    { hour: "4 PM", activities: 187, productivity: 85 }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call': return '📞';
      case 'Email': return '✉️';
      case 'Meeting': return '🤝';
      case 'Task': return '✅';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
      <select
        value={activityType}
        onChange={(e) => setActivityType(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Activities</option>
        <option value="calls">Calls Only</option>
        <option value="emails">Emails Only</option>
        <option value="meetings">Meetings Only</option>
      </select>
    </>
  );

  return (
    <PageWrapper
      title="Activity Dashboard"
      description="Comprehensive activity metrics and trends"
      onBack={onBack}
      appTheme="blue"
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {activityMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Activity className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Activity Breakdown"
          description="Distribution of activities by type and performance"
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {activityTypes.map((activity, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{activity.type}</h3>
                  <span className="text-2xl font-bold text-blue-600">{activity.count}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Share</p>
                    <p className="font-semibold text-gray-900">{activity.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Duration</p>
                    <p className="font-semibold text-gray-900">{activity.avgDuration}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Success Rate</p>
                    <p className="font-semibold text-gray-900">{activity.success}%</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${activity.percentage * 2.5}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Hourly Activity Pattern"
          description="Activity distribution throughout the day"
          icon={<Clock className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            {hourlyActivity.map((hour, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 w-16">{hour.hour}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(hour.activities / 234) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{hour.activities}</p>
                  <p className="text-sm text-green-600">{hour.productivity}% productive</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Recent Activities"
          description="Latest team activities and outcomes"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
        >
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const user = teamMembers.find(m => m.name === activity.user);
              
              return (
                <div key={activity.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{activity.time}</span>
                        <span>Duration: {activity.duration}</span>
                      </div>
                      <p className="text-sm text-gray-700">{activity.outcome}</p>
                    </div>
                  </div>
                  
                  {user && (
                    <div className="flex items-center gap-2">
                      <Avatar 
                        src={user.avatar} 
                        fallback={user.initials}
                        status={user.status}
                        size="sm"
                      />
                      <span className="text-sm text-gray-600">{activity.user}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section
          title="Team Activity Leaderboard"
          description="Top performers by activity completion"
          icon={<Users className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            {teamMembers.map((member, index) => {
              const activities = Math.floor(Math.random() * 50) + 30;
              const completion = Math.floor(Math.random() * 20) + 80;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </span>
                    <Avatar 
                      src={member.avatar} 
                      fallback={member.initials}
                      status={member.status}
                      size="md"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{activities} activities today</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg text-orange-600">{completion}%</p>
                    <p className="text-sm text-gray-600">Completion rate</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <Section
        title="Activity Insights"
        description="AI-generated insights and recommendations"
        icon={<Zap className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Peak Performance</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Best productivity: 11 AM - 3 PM</li>
              <li>• Highest success rates on Tuesdays</li>
              <li>• Meetings show 94% success rate</li>
              <li>• Follow-up calls most effective</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Opportunities</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Increase email efficiency by 15%</li>
              <li>• Schedule more meetings in peak hours</li>
              <li>• Automate routine task activities</li>
              <li>• Focus on high-value call activities</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Recommendations</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Block calendar for focused work</li>
              <li>• Implement activity templates</li>
              <li>• Set up activity reminders</li>
              <li>• Review weekly activity patterns</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};