import { useState, useEffect, useCallback } from 'react';
import { contentService } from '../services/contentService';

export function useAppContent<T>(
  key: string, 
  initialValue: T, 
  userId?: string,
  autoSave: boolean = true
) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedData = await contentService.loadContent<T>(key, userId);
        
        if (loadedData !== null) {
          setData(loadedData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
        console.error('Error loading app content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, userId]);

  // Save data function
  const saveData = useCallback(async (newData: T) => {
    try {
      setError(null);
      
      const success = await contentService.saveContent(key, newData, userId);
      
      if (success) {
        setData(newData);
        return true;
      } else {
        setError('Failed to save content');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save content';
      setError(errorMessage);
      console.error('Error saving app content:', err);
      return false;
    }
  }, [key, userId]);

  // Update data (with optional auto-save)
  const updateData = useCallback((newData: T) => {
    setData(newData);
    
    if (autoSave) {
      saveData(newData);
    }
  }, [autoSave, saveData]);

  // Manual save function for when autoSave is disabled
  const save = useCallback(() => saveData(data), [data, saveData]);

  return {
    data,
    setData: updateData,
    loading,
    error,
    save,
    refetch: () => {
      setLoading(true);
      contentService.loadContent<T>(key, userId).then(loadedData => {
        if (loadedData !== null) {
          setData(loadedData);
        }
        setLoading(false);
      });
    }
  };
}

// Specialized hooks for common content types
export function useDashboardSettings(userId?: string) {
  return useAppContent(
    'dashboard_settings',
    {
      selectedCategory: 'All',
      viewMode: 'grid' as const,
      searchTerm: '',
      favoriteApps: [],
      theme: 'system' as const
    },
    userId
  );
}

export function useUserPreferences(userId?: string) {
  return useAppContent(
    'user_preferences',
    {
      defaultTimeRange: '30d',
      notificationsEnabled: true,
      autoRefresh: true,
      refreshInterval: 30000
    },
    userId
  );
}

export function useAppAnalytics(userId?: string) {
  return useAppContent(
    'app_analytics',
    [],
    userId
  );
}

export function useKPIConfiguration(userId?: string) {
  return useAppContent(
    'kpi_configuration',
    {
      metrics: [
        { id: 'active_deals', title: 'Active Deals', enabled: true, order: 1 },
        { id: 'pipeline_value', title: 'Pipeline Value', enabled: true, order: 2 },
        { id: 'won_deals', title: 'Won Deals', enabled: true, order: 3 },
        { id: 'avg_deal_size', title: 'Avg Deal Size', enabled: true, order: 4 }
      ],
      refreshRate: 30000,
      alertThresholds: {
        revenue: { warning: 80, critical: 60 },
        deals: { warning: 90, critical: 70 },
        conversion: { warning: 85, critical: 75 }
      }
    },
    userId
  );
}