import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AIChartProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  data: number[];
}

export const AIChart: React.FC<AIChartProps> = ({ title, value, change, trend, data }) => {
  return (
    <div className="glass-card rounded-xl p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          <span className="text-sm font-medium">{change}</span>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <div className="flex items-center space-x-1">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                trend === 'up' ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: '75%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};