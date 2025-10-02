import React, { useState } from 'react';
import { TrendingDown, BarChart3, Users, Clock, Target, MessageSquare } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface CommPerformanceProps {
  onBack: () => void;
}

export const CommPerformance: React.FC<CommPerformanceProps> = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const performanceMetrics = [
    { title: "Communication ROI", value: "312%", change: 23.5, trend: "up" as const, color: "success" as const },
    { title: "Engagement Rate", value: "78.5%", change: 12.3, trend: "up" as const, color: "primary" as const },
    { title: "Cost per Contact", value: "$12.50", change: -18.7, trend: "up" as const, color: "success" as const },
    { title: "Conversion Rate", value: "24.8%", change: 8.9, trend: "up" as const, color: "success" as const }
  ];

  const channelPerformance = [
    { channel: "Email", cost: "$8.20", conversion: "28%", roi: "340%" },
    { channel: "Phone", cost: "$24.50", conversion: "45%", roi: "280%" },
    { channel: "Video Call", cost: "$18.30", conversion: "52%", roi: "420%" },
    { channel: "Chat", cost: "$3.80", conversion: "18%", roi: "180%" }
  ];

  return (
    <PageWrapper
      title="Comm Performance"
      description="Communication ROI and performance analytics dashboard"
      onBack={onBack}
      appTheme="purple"
      headerActions={
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<TrendingDown className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Channel ROI Analysis"
          description="Performance and cost effectiveness by channel"
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
        >
          <div className="space-y-4">
            {channelPerformance.map((channel, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{channel.channel}</h3>
                  <span className="text-purple-600 font-medium">{channel.roi} ROI</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Cost per Contact</p>
                    <p className="font-semibold text-gray-900">{channel.cost}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Conversion Rate</p>
                    <p className="font-semibold text-gray-900">{channel.conversion}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ROI</p>
                    <p className="font-semibold text-purple-600">{channel.roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Team Performance"
          description="Individual communication effectiveness"
          icon={<Users className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {teamMembers.slice(0, 5).map((member, index) => {
              const roi = Math.floor(Math.random() * 200) + 250;
              const contacts = Math.floor(Math.random() * 50) + 25;
              
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
                      <p className="text-sm text-gray-600">{contacts} contacts</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg text-purple-600">{roi}%</p>
                    <p className="text-sm text-gray-600">ROI</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <Section
        title="Performance Optimization"
        description="Strategies to improve communication ROI"
        icon={<Target className="w-6 h-6 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">High ROI Channels</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Video calls show highest conversion</li>
              <li>• Email remains cost-effective</li>
              <li>• Phone calls for complex deals</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Optimization Opportunities</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Automate initial touchpoints</li>
              <li>• Segment by prospect type</li>
              <li>• A/B test message templates</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Resource Allocation</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Invest more in video capabilities</li>
              <li>• Reduce low-performing channels</li>
              <li>• Train team on high-ROI tactics</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};