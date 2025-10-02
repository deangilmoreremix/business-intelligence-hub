import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Activity, Target, AlertTriangle } from 'lucide-react';
import { aiAnalyticsEngine, type AIAnalyticsMetrics } from '../../services/aiAnalyticsEngine';
import { GlassCard } from '../ui/GlassCard';
import { ModernButton } from '../ui/ModernButton';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { cn } from '../../lib/utils';

interface AIAnalyticsDashboardProps {
  className?: string;
}

export const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<AIAnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalyticsMetrics();
  }, [selectedTimeRange]);

  const loadAnalyticsMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await aiAnalyticsEngine.getAnalyticsMetrics(selectedTimeRange);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading AI analytics metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runBusinessOptimization = async () => {
    try {
      const optimizationPlan = await aiAnalyticsEngine.getBusinessOptimizationPlan();
      console.log('Business optimization plan:', optimizationPlan);
      // Could open a modal or navigate to detailed view
    } catch (error) {
      console.error('Error generating optimization plan:', error);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* AI Analytics Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Analytics Overview</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI insights and analysis performance across all applications
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <ModernButton onClick={runBusinessOptimization}>
            <Zap className="w-4 h-4" />
            Business Optimization
          </ModernButton>
        </div>
      </div>

      {/* AI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total AI Analyses"
          value={metrics.totalAnalyses.toString()}
          trend="up"
          color="primary"
          icon={<Brain className="w-6 h-6" />}
        />
        <KPICard
          title="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          trend="up"
          color="success"
          icon={<Target className="w-6 h-6" />}
        />
        <KPICard
          title="Avg Processing Time"
          value={`${(metrics.avgProcessingTime / 1000).toFixed(1)}s`}
          trend="down"
          color="success"
          icon={<Activity className="w-6 h-6" />}
        />
        <KPICard
          title="Business Impact"
          value={metrics.businessImpactGenerated.revenue}
          trend="up"
          color="success"
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Provider Performance */}
        <Section
          title="AI Provider Performance"
          description="Performance comparison between AI providers"
          icon={<Zap className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-4">
            {metrics.providerUsage.map((provider, index) => (
              <div key={provider.provider} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {provider.provider === 'gpt-5' ? (
                      <Brain className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Zap className="w-5 h-5 text-green-600" />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {provider.provider.toUpperCase()}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {provider.count} analyses
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Usage Count</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{provider.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Avg Time</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {(provider.avgTime / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Top Insight Types */}
        <Section
          title="Most Common Insights"
          description="Types of insights AI generates most frequently"
          icon={<Target className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            {metrics.topInsightTypes.map((insight, index) => (
              <div key={insight.type} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-sm font-bold text-green-800 dark:text-green-200">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {insight.type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{insight.count}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Business Impact Summary */}
      <Section
        title="AI-Generated Business Impact"
        description="Measurable outcomes from AI insights and recommendations"
        icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Revenue Impact</h3>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
              {metrics.businessImpactGenerated.revenue}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              From implemented AI recommendations
            </p>
          </div>
          
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Efficiency Gains</h3>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              {metrics.businessImpactGenerated.efficiency}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Productivity improvement measured
            </p>
          </div>
          
          <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Risk Reduction</h3>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">
              {metrics.businessImpactGenerated.riskReduction}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Issues prevented by AI alerts
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
};