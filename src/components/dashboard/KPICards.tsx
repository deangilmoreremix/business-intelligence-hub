import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useDealStore } from '../../store/dealStore';
import { useContactStore } from '../../store/contactStore';
import { useCRMIntegration } from '../../hooks/useCRMIntegration';
import Avatar from '../ui/Avatar';
import { getInitials } from '../../utils/avatars';
import { cn } from '../../lib/utils';

interface KPIMetric {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  relatedContacts?: Array<{ id: string; name: string; avatar?: string; avatarSrc?: string }>;
}

const KPICards: React.FC = () => {
  const { isDark } = useTheme();
  const { navigateToFeature } = useNavigation();
  const { deals } = useDealStore();
  const { contacts } = useContactStore();
  const { isConnected, lastSync } = useCRMIntegration();

  // Load data on mount if CRM is connected
  useEffect(() => {
    if (isConnected) {
      const dealStore = useDealStore.getState();
      const contactStore = useContactStore.getState();
      
      dealStore.loadDealsFromSupabase();
      contactStore.loadContactsFromSupabase();
    }
  }, [isConnected]);
  // Get active deals with their contacts
  const getActiveDealsWithContacts = () => {
    const activeDeals = Object.values(deals).filter(deal =>
      deal.stage !== 'closed-won' && deal.stage !== 'closed-lost'
    );

    return activeDeals.map(deal => ({
      ...deal,
      contact: contacts[deal.contactId]
    })).filter(deal => deal.contact); // Only include deals with valid contacts
  };

  // Get won deals with their contacts
  const getWonDealsWithContacts = () => {
    const wonDeals = Object.values(deals).filter(deal =>
      deal.stage === 'closed-won'
    );

    return wonDeals.map(deal => ({
      ...deal,
      contact: contacts[deal.contactId]
    })).filter(deal => deal.contact); // Only include deals with valid contacts
  };

  const activeDealsWithContacts = getActiveDealsWithContacts();
  const wonDealsWithContacts = getWonDealsWithContacts();

  // Calculate metrics
  const calculateMetrics = () => {
    const dealsArray = Object.values(deals);
    let totalActiveDeals = 0;
    let totalValue = 0;
    let wonValue = 0;

    dealsArray.forEach(deal => {
      if (deal.stage !== 'closed-won' && deal.stage !== 'closed-lost') {
        totalActiveDeals++;
        totalValue += deal.value;
      }

      if (deal.stage === 'closed-won') {
        wonValue += deal.value;
      }
    });

    return {
      totalActiveDeals,
      totalValue,
      avgDealSize: totalActiveDeals > 0 ? totalValue / totalActiveDeals : 0,
      wonDeals: Object.values(deals).filter(d => d.stage === 'closed-won').length
    };
  };

  const metrics = calculateMetrics();

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Render avatar stack component
  const renderAvatarStack = (deals: any[], maxAvatars: number = 3) => {
    const displayDeals = deals.slice(0, maxAvatars);
    const extraCount = Math.max(0, deals.length - maxAvatars);

    return (
      <div className="flex items-center space-x-1">
        <div className="flex -space-x-2">
          {displayDeals.map((deal, index) => (
            <div key={deal.id} className="relative" style={{ zIndex: maxAvatars - index }}>
              <Avatar
                src={deal.contact.avatarSrc || deal.contact.avatar}
                alt={deal.contact.name}
                size="sm"
                fallback={getInitials(deal.contact.name)}
                className="border-2 border-white dark:border-gray-800"
              />
            </div>
          ))}
          {extraCount > 0 && (
            <div className={cn(
              `w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800`,
              isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
            )}>
              +{extraCount}
            </div>
          )}
        </div>
        <span className={cn(`text-2xl font-bold`, isDark ? 'text-gray-100' : 'text-gray-900')}>
          {deals.length}
        </span>
      </div>
    );
  };

  const kpis = [
    {
      title: 'Active Deals',
      value: metrics.totalActiveDeals.toString(),
      change: 12,
      trend: 'up' as const,
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      feature: 'pipeline-intelligence',
      renderContent: () => activeDealsWithContacts.length > 0 ?
        renderAvatarStack(activeDealsWithContacts) :
        <h3 className={cn(`text-2xl font-bold`, isDark ? 'text-white group-hover:text-green-400' : 'text-gray-900 group-hover:text-green-600', `transition-colors`)}>
          {metrics.totalActiveDeals}
        </h3>
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(metrics.totalValue),
      change: 8,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      feature: 'pipeline-intelligence',
      renderContent: () =>
        <h3 className={cn(`text-2xl font-bold`, isDark ? 'text-white group-hover:text-green-400' : 'text-gray-900 group-hover:text-green-600', `transition-colors`)}>
          {formatCurrency(metrics.totalValue)}
        </h3>
    },
    {
      title: 'Won Deals',
      value: metrics.wonDeals.toString(),
      change: 15,
      trend: 'up' as const,
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      feature: 'pipeline-intelligence',
      renderContent: () => wonDealsWithContacts.length > 0 ?
        renderAvatarStack(wonDealsWithContacts) :
        <h3 className={cn(`text-2xl font-bold`, isDark ? 'text-white group-hover:text-green-400' : 'text-gray-900 group-hover:text-green-600', `transition-colors`)}>
          {metrics.wonDeals}
        </h3>
    },
    {
      title: 'Avg Deal Size',
      value: formatCurrency(metrics.avgDealSize),
      change: -3,
      trend: 'down' as const,
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      feature: 'sales-cycle-analytics',
      renderContent: () =>
        <h3 className={cn(`text-2xl font-bold`, isDark ? 'text-white group-hover:text-green-400' : 'text-gray-900 group-hover:text-green-600', `transition-colors`)}>
          {formatCurrency(metrics.avgDealSize)}
        </h3>
    }
  ];

  return (
    <div className="space-y-6">
      {/* CRM Status Indicator */}
      {isConnected && lastSync && (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              Connected to SmartCRM
            </span>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400">
            Last sync: {new Date(lastSync).toLocaleTimeString()}
          </span>
        </div>
      )}
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          onClick={() => navigateToFeature(kpi.feature)}
          className={cn(
            'glass-card rounded-2xl p-6 cursor-pointer group transition-all duration-300',
            'bg-white/80 dark:bg-gray-800/80',
            'border border-gray-200/60 dark:border-gray-700/60',
            'hover:shadow-xl hover:scale-[1.02]',
            'hover:bg-white/90 dark:hover:bg-gray-800/90',
            'backdrop-blur-md'
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={cn(`p-3 rounded-xl bg-gradient-to-r ${kpi.color} shadow-lg`)}>
              <kpi.icon className="h-6 w-6 text-white" />
            </div>
            <div className={cn(`flex items-center`, kpi.trend === 'up' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
              {kpi.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {kpi.change > 0 ? '+' : ''}{kpi.change}%
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {kpi.renderContent && (
              <div>
                {kpi.renderContent()}
              </div>
            )}
            <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600', `text-sm transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400`)}>
              {kpi.title}
            </p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default KPICards;