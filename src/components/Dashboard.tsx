import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid2x2 as Grid, List } from 'lucide-react';
import { AppCard } from './AppCard';
import { DarkModeToggle } from './ui/DarkModeToggle';
import { ModernButton } from './ui/ModernButton';
import { aiApps } from '../data/aiApps';
import KPICards from './dashboard/KPICards';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

import { SupabaseStatus } from './ui/SupabaseStatus';
import { CRMConnectionStatus } from './ui/CRMConnectionStatus';
import { CRMSetupModal } from './ui/CRMSetupModal';
import { NavigationBar } from './ui/NavigationBar';
import { AIAnalyticsDashboard } from './dashboard/AIAnalyticsDashboard';

export const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCRMSetup, setShowCRMSetup] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const categories = ['All', ...Array.from(new Set(aiApps.map(app => app.category)))];
  
  const filteredApps = aiApps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={cn(
      "min-h-screen p-6 transition-colors duration-300",
      isDark 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-white"
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Business Intelligence Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Powerful AI-driven Intelligence Hub
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NavigationBar showLabels={false} />
            <DarkModeToggle />
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards />

        {/* AI Analytics Overview */}
        <AIAnalyticsDashboard className="mb-8" />

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search AI applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "px-4 py-3 rounded-lg transition-all duration-200 appearance-none",
                  "border-2 border-gray-300 dark:border-gray-500",
                  "bg-white dark:bg-gray-700",
                  "text-gray-900 dark:text-white",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "focus:outline-none font-medium"
                )}
                style={{
                  backgroundColor: isDark ? '#374155' : '#ffffff',
                  color: isDark ? '#ffffff' : '#111827',
                  borderColor: isDark ? '#64748b' : '#d1d5db'
                }}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={cn(
                "px-4 py-3 rounded-lg transition-all duration-200",
                "border border-gray-200 dark:border-gray-600",
                "bg-white dark:bg-gray-800",
                "text-gray-900 dark:text-gray-100",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "focus:outline-none"
              )}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded transition-all duration-200',
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded transition-all duration-200',
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredApps.map((app, index) => (
            <div key={app.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <AppCard
                title={app.title}
                description={app.description}
                icon={app.icon}
                category={app.category}
                onClick={() => navigate(`/app/${app.id}`)}
              />
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No apps found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* CRM Setup Modal */}
        <CRMSetupModal
          isOpen={showCRMSetup}
          onClose={() => setShowCRMSetup(false)}
          onSuccess={() => {
            console.log('CRM setup successful');
            // Optionally trigger a data refresh here
          }}
        />
      </div>
    </div>
  );
};
