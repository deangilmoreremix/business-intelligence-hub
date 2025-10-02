export interface AppContent {
  id: string;
  key: string;
  value: any;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSettings {
  selectedCategory: string;
  viewMode: 'grid' | 'list';
  searchTerm: string;
  favoriteApps: string[];
  theme: 'light' | 'dark' | 'system';
}

export interface UserPreferences {
  defaultTimeRange: string;
  notificationsEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  customColors?: {
    primary: string;
    secondary: string;
  };
}

export interface AppAnalytics {
  appId: string;
  viewCount: number;
  lastAccessed: string;
  timeSpent: number;
  favorited: boolean;
}

export interface KPIConfiguration {
  metrics: Array<{
    id: string;
    title: string;
    enabled: boolean;
    order: number;
  }>;
  refreshRate: number;
  alertThresholds: {
    [key: string]: {
      warning: number;
      critical: number;
    };
  };
}