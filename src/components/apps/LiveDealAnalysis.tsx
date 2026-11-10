import React, { useState, useEffect } from 'react';
import { Brain, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface LiveDealAnalysisProps {
  onBack?: () => void;
}

export const LiveDealAnalysis: React.FC<LiveDealAnalysisProps> = ({ onBack }) => {
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLiveMode]);

  const liveMetrics = [
    { title: "Active Deals", value: "147", change: 3, trend: "up" as const, color: "primary" as const },
    { title: "Hot Prospects", value: "23", change: 5, trend: "up" as const, color: "warning" as const },
    { title: "At Risk", value: "8", change: -2, trend: "up" as const, color: "danger" as const },
    { title: "Closed Today", value: "5", change: 12, trend: "up" as const, color: "success" as const }
  ];

  const liveDeals = [
    {
      id: 1,
      company: "TechCorp",
      value: "$125K",
      stage: "Negotiation",
      assignee: "Sarah Johnson",
      activity: "Email sent 5 min ago",
      status: "hot",
      probability: 85
    },
    {
      id: 2,
      company: "Global Inc",
      value: "$89K", 
      stage: "Proposal",
      assignee: "Michael Chen",
      activity: "Meeting scheduled",
      status: "warm",
      probability: 65
    },
    {
      id: 3,
      company: "Innovation Labs",
      value: "$67K",
      stage: "Demo",
      assignee: "Emily Rodriguez",
      activity: "Demo completed",
      status: "cold",
      probability: 45
    }
  ];

  const headerActions = (
    <ModernButton
      variant={isLiveMode ? "primary" : "outline"}
      onClick={() => setIsLiveMode(!isLiveMode)}
    >
      <Activity className="w-4 h-4" />
      {isLiveMode ? "Live Mode ON" : "Live Mode OFF"}
    </ModernButton>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'text-red-600 bg-red-100';
      case 'warm': return 'text-yellow-600 bg-yellow-100';
      case 'cold': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <PageWrapper
      title="Live Deal Analysis"
      description="Real-time deal intelligence with AI-powered insights"
      onBack={onBack}
      headerActions={headerActions}
    >
      {/* Live Status */}
      <div className="mb-6">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-green-800 font-medium">
            {isLiveMode ? 'Live monitoring active' : 'Live monitoring paused'} • Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {liveMetrics.map((metric, index) => (
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
        {/* Live Deal Stream */}
        <Section
          title="Live Deal Stream"
          description="Real-time deal activity and updates"
          icon={<Brain className="w-6 h-6 text-cyan-600" />}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {liveDeals.map((deal) => {
              const assignedMember = teamMembers.find(m => m.name === deal.assignee);
              
              return (
                <div key={deal.id} className="p-4 border border-gray-200 rounded-lg animate-slide-in">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{deal.company}</h3>
                      <p className="text-sm text-gray-600">{deal.stage} • {deal.value}</p>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(deal.status)}`}>
                      {deal.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    {assignedMember && (
                      <>
                        <Avatar 
                          src={assignedMember.avatar} 
                          fallback={assignedMember.initials}
                          status={assignedMember.status}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{deal.assignee}</p>
                          <p className="text-xs text-gray-600">{deal.activity}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${deal.probability}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{deal.probability}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* AI Alerts */}
        <Section
          title="AI Smart Alerts"
          description="Intelligent notifications and recommendations"
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            {[
              {
                type: "urgent",
                title: "High-value deal stalled",
                message: "TechCorp deal ($125K) hasn't had activity in 3 days",
                action: "Schedule follow-up call"
              },
              {
                type: "opportunity", 
                title: "Buying signals detected",
                message: "Innovation Labs visited pricing page 5x today",
                action: "Send pricing proposal"
              },
              {
                type: "risk",
                title: "Competitor mentioned",
                message: "Global Inc mentioned competitor in last email",
                action: "Prepare competitive response"
              }
            ].map((alert, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    alert.type === 'urgent' ? 'bg-red-100' : 
                    alert.type === 'opportunity' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.type === 'urgent' ? 'text-red-600' :
                      alert.type === 'opportunity' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <ModernButton variant="outline" size="sm">
                      {alert.action}
                    </ModernButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Real-time Insights */}
      <Section
        title="Real-time AI Insights"
        description="Live analysis and recommendations"
        icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Trending Up</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enterprise segment activity +25%</li>
              <li>• Demo-to-proposal rate improving</li>
              <li>• Q4 momentum building</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Watch Areas</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 8 deals need urgent attention</li>
              <li>• SMB conversion rate declining</li>
              <li>• Response times increasing</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Quick Wins</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 5 deals ready for close</li>
              <li>• 12 warm prospects to contact</li>
              <li>• 3 upsell opportunities</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};