import { supabase } from '../lib/supabase';
import type { AppContent, DashboardSettings, UserPreferences, AppAnalytics, KPIConfiguration } from '../types/content';

class ContentService {
  /**
   * Save content to Supabase using upsert (insert or update)
   */
  async saveContent<T = any>(key: string, value: T, userId?: string): Promise<AppContent | null> {
    try {
      const { data, error } = await supabase
        .from('app_content')
        .upsert(
          {
            key,
            value,
            user_id: userId || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        )
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist - silently fail and return null
          console.warn('app_content table does not exist. Please run the Supabase migration.');
          return null;
        }
        console.error('Error saving content:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveContent:', error);
      return null;
    }
  }

  /**
   * Load content from Supabase by key
   */
  async loadContent<T = any>(key: string, userId?: string): Promise<T | null> {
    try {
      let query = supabase
        .from('app_content')
        .select('value')
        .eq('key', key);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          // No matching record found
          return null;
        }
        console.error('Error loading content:', error);
        return null;
      }

      return data?.value || null;
    } catch (error) {
      console.error('Error in loadContent:', error);
      return null;
    }
  }

  /**
   * Delete content by key
   */
  async deleteContent(key: string, userId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('app_content')
        .delete()
        .eq('key', key);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { error } = await query;

      if (error) {
        console.error('Error deleting content:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteContent:', error);
      return false;
    }
  }

  /**
   * Get all content keys (for debugging/admin)
   */
  async getAllKeys(userId?: string): Promise<string[]> {
    try {
      let query = supabase
        .from('app_content')
        .select('key');

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting all keys:', error);
        return [];
      }

      return data?.map(item => item.key) || [];
    } catch (error) {
      console.error('Error in getAllKeys:', error);
      return [];
    }
  }

  // Specific typed methods for common content types
  async saveDashboardSettings(settings: DashboardSettings, userId?: string): Promise<boolean> {
    const result = await this.saveContent('dashboard_settings', settings, userId);
    return result !== null;
  }

  async loadDashboardSettings(userId?: string): Promise<DashboardSettings | null> {
    return await this.loadContent<DashboardSettings>('dashboard_settings', userId);
  }

  async saveUserPreferences(preferences: UserPreferences, userId?: string): Promise<boolean> {
    const result = await this.saveContent('user_preferences', preferences, userId);
    return result !== null;
  }

  async loadUserPreferences(userId?: string): Promise<UserPreferences | null> {
    return await this.loadContent<UserPreferences>('user_preferences', userId);
  }

  async saveAppAnalytics(analytics: AppAnalytics[], userId?: string): Promise<boolean> {
    const result = await this.saveContent('app_analytics', analytics, userId);
    return result !== null;
  }

  async loadAppAnalytics(userId?: string): Promise<AppAnalytics[] | null> {
    return await this.loadContent<AppAnalytics[]>('app_analytics', userId);
  }

  async saveKPIConfiguration(config: KPIConfiguration, userId?: string): Promise<boolean> {
    const result = await this.saveContent('kpi_configuration', config, userId);
    return result !== null;
  }

  async loadKPIConfiguration(userId?: string): Promise<KPIConfiguration | null> {
    return await this.loadContent<KPIConfiguration>('kpi_configuration', userId);
  }
}

export const contentService = new ContentService();