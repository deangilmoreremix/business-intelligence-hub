import React, { useState } from 'react';
import { Shuffle, MessageSquare, Mail, Phone, Video, Zap } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';

interface ChannelSyncHubProps {
  onBack: () => void;
}

export const ChannelSyncHub: React.FC<ChannelSyncHubProps> = ({ onBack }) => {
  const [syncStatus, setSyncStatus] = useState('active');

  const syncMetrics = [
    { title: "Sync Accuracy", value: "98.5%", change: 2.1, trend: "up" as const, color: "success" as const },
    { title: "Active Channels", value: "8", change: 0, trend: "up" as const, color: "primary" as const },
    { title: "Messages Synced", value: "2,847", change: 15.3, trend: "up" as const, color: "primary" as const },
    { title: "Sync Speed", value: "1.2s", change: -18.7, trend: "up" as const, color: "success" as const }
  ];

  const channels = [
    { name: "Email", icon: Mail, status: "synced", messages: 1247, lastSync: "2 min ago" },
    { name: "Phone", icon: Phone, status: "synced", messages: 689, lastSync: "1 min ago" },
    { name: "Video Calls", icon: Video, status: "syncing", messages: 234, lastSync: "syncing..." },
    { name: "Chat", icon: MessageSquare, status: "synced", messages: 521, lastSync: "30 sec ago" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600 bg-green-100';
      case 'syncing': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <PageWrapper
      title="Channel Sync Hub"
      description="Multi-channel coordination and synchronization dashboard"
      onBack={onBack}
      appTheme="cyan"
      headerActions={
        <ModernButton>
          <Zap className="w-4 h-4" />
          Force Sync All
        </ModernButton>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {syncMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Shuffle className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Channel Status"
          description="Real-time synchronization status"
          icon={<Shuffle className="w-6 h-6 text-cyan-600" />}
        >
          <div className="space-y-4">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <Icon className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{channel.name}</h3>
                        <p className="text-sm text-gray-600">{channel.messages} messages</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(channel.status)}`}>
                      {channel.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Last sync: {channel.lastSync}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section
          title="Sync Analytics"
          description="Performance metrics and insights"
          icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Today's Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Syncs</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Success Rate</span>
                  <span className="font-medium">98.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Avg Response Time</span>
                  <span className="font-medium">1.2s</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Channel Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">All Channels Online</span>
                  <span className="font-medium">✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Data Integrity</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </PageWrapper>
  );
};