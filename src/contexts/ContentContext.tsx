import React, { createContext, useContext, useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import type { DashboardSettings, UserPreferences } from '../types/content';

interface ContentContextType {
  // Dashboard settings
  dashboardSettings: DashboardSettings;
  updateDashboardSettings: (settings: Partial<DashboardSettings>) => void;
  
  // User preferences
  userPreferences: UserPreferences;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  
  // App analytics
  trackAppUsage: (appId: string) => void;
  getAppAnalytics: () => Promise<any[]>;
  
  // Utility functions
  isLoading: boolean;
  saveAll: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    selectedCategory: 'All',
    viewMode: 'grid',
    searchTerm: '',
    favoriteApps: [],
    theme: 'system'
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    defaultTimeRange: '30d',
    notificationsEnabled: true,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Load dashboard settings
        try {
          const savedDashboard = await contentService.loadDashboardSettings();
          if (savedDashboard) {
            setDashboardSettings(savedDashboard);
          }
        } catch (error) {
          console.warn('Could not load dashboard settings, using defaults');
        }

        // Load user preferences
        try {
          const savedPreferences = await contentService.loadUserPreferences();
          if (savedPreferences) {
            setUserPreferences(savedPreferences);
          }
        } catch (error) {
          console.warn('Could not load user preferences, using defaults');
        }
      } catch (error) {
        console.warn('Error loading initial data, using defaults:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const updateDashboardSettings = async (newSettings: Partial<DashboardSettings>) => {
    const updated = { ...dashboardSettings, ...newSettings };
    setDashboardSettings(updated);
    await contentService.saveDashboardSettings(updated);
  };

  const updateUserPreferences = async (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...userPreferences, ...newPreferences };
    setUserPreferences(updated);
    await contentService.saveUserPreferences(updated);
  };

  const trackAppUsage = async (appId: string) => {
    try {
      const existingAnalytics = await contentService.loadAppAnalytics() || [];
      
      const appIndex = existingAnalytics.findIndex(app => app.appId === appId);
      
      if (appIndex >= 0) {
        // Update existing analytics
        existingAnalytics[appIndex] = {
          ...existingAnalytics[appIndex],
          viewCount: existingAnalytics[appIndex].viewCount + 1,
          lastAccessed: new Date().toISOString(),
          timeSpent: existingAnalytics[appIndex].timeSpent + Math.random() * 300000 // Simulate time spent
        };
      } else {
        // Add new analytics entry
        existingAnalytics.push({
          appId,
          viewCount: 1,
          lastAccessed: new Date().toISOString(),
          timeSpent: Math.random() * 300000,
          favorited: false
        });
      }

      await contentService.saveAppAnalytics(existingAnalytics);
    } catch (error) {
      console.error('Error tracking app usage:', error);
    }
  };

  const getAppAnalytics = async () => {
    try {
      return await contentService.loadAppAnalytics() || [];
    } catch (error) {
      console.error('Error getting app analytics:', error);
      return [];
    }
  };

  const saveAll = async () => {
    try {
      await Promise.all([
        contentService.saveDashboardSettings(dashboardSettings),
        contentService.saveUserPreferences(userPreferences)
      ]);
    } catch (error) {
      console.error('Error saving all data:', error);
    }
  };

  const clearAllData = async () => {
    try {
      const keys = await contentService.getAllKeys();
      await Promise.all(keys.map(key => contentService.deleteContent(key)));
      
      // Reset to defaults
      setDashboardSettings({
        selectedCategory: 'All',
        viewMode: 'grid',
        searchTerm: '',
        favoriteApps: [],
        theme: 'system'
      });
      
      setUserPreferences({
        defaultTimeRange: '30d',
        notificationsEnabled: true,
        autoRefresh: true,
        refreshInterval: 30000
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  };

  return (
    <ContentContext.Provider value={{
      dashboardSettings,
      updateDashboardSettings,
      userPreferences,
      updateUserPreferences,
      trackAppUsage,
      getAppAnalytics,
      isLoading,
      saveAll,
      clearAllData
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};