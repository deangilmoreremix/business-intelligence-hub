import { supabase } from '../lib/supabase';
import { WalkthroughProgress } from '../types/walkthrough';

const getUserId = (): string => {
  let userId = localStorage.getItem('walkthrough_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('walkthrough_user_id', userId);
  }
  return userId;
};

export const walkthroughService = {
  async getProgress(walkthroughId: string): Promise<WalkthroughProgress | null> {
    const userId = getUserId();

    const { data, error } = await supabase
      .from('walkthrough_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('walkthrough_id', walkthroughId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching walkthrough progress:', error);
      return null;
    }

    if (!data) return null;

    return {
      walkthroughId: data.walkthrough_id,
      currentStep: data.current_step,
      totalSteps: data.total_steps,
      completed: data.completed,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      lastSeenAt: new Date(data.last_seen_at)
    };
  },

  async getAllProgress(): Promise<WalkthroughProgress[]> {
    const userId = getUserId();

    const { data, error } = await supabase
      .from('walkthrough_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching all walkthrough progress:', error);
      return [];
    }

    return (data || []).map(item => ({
      walkthroughId: item.walkthrough_id,
      currentStep: item.current_step,
      totalSteps: item.total_steps,
      completed: item.completed,
      startedAt: new Date(item.started_at),
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      lastSeenAt: new Date(item.last_seen_at)
    }));
  },

  async saveProgress(
    walkthroughId: string,
    currentStep: number,
    totalSteps: number,
    completed: boolean = false
  ): Promise<void> {
    const userId = getUserId();

    const progressData = {
      user_id: userId,
      walkthrough_id: walkthroughId,
      current_step: currentStep,
      total_steps: totalSteps,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      last_seen_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('walkthrough_progress')
      .upsert(progressData, {
        onConflict: 'user_id,walkthrough_id'
      });

    if (error) {
      console.error('Error saving walkthrough progress:', error);
    }
  },

  async markCompleted(walkthroughId: string): Promise<void> {
    const userId = getUserId();

    const { error } = await supabase
      .from('walkthrough_progress')
      .upsert({
        user_id: userId,
        walkthrough_id: walkthroughId,
        completed: true,
        completed_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,walkthrough_id'
      });

    if (error) {
      console.error('Error marking walkthrough as completed:', error);
    }
  },

  async resetProgress(walkthroughId?: string): Promise<void> {
    const userId = getUserId();

    if (walkthroughId) {
      const { error } = await supabase
        .from('walkthrough_progress')
        .delete()
        .eq('user_id', userId)
        .eq('walkthrough_id', walkthroughId);

      if (error) {
        console.error('Error resetting walkthrough progress:', error);
      }
    } else {
      const { error } = await supabase
        .from('walkthrough_progress')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error resetting all walkthrough progress:', error);
      }
    }
  },

  async trackTooltipInteraction(tooltipId: string, dismissed: boolean = false): Promise<void> {
    const userId = getUserId();

    const { data: existing } = await supabase
      .from('tooltip_interactions')
      .select('interaction_count')
      .eq('user_id', userId)
      .eq('tooltip_id', tooltipId)
      .maybeSingle();

    const interactionCount = (existing?.interaction_count || 0) + 1;

    const { error } = await supabase
      .from('tooltip_interactions')
      .upsert({
        user_id: userId,
        tooltip_id: tooltipId,
        interaction_count: interactionCount,
        dismissed,
        last_interaction_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,tooltip_id'
      });

    if (error) {
      console.error('Error tracking tooltip interaction:', error);
    }
  },

  async isTooltipDismissed(tooltipId: string): Promise<boolean> {
    const userId = getUserId();

    const { data, error } = await supabase
      .from('tooltip_interactions')
      .select('dismissed')
      .eq('user_id', userId)
      .eq('tooltip_id', tooltipId)
      .maybeSingle();

    if (error) {
      console.error('Error checking tooltip status:', error);
      return false;
    }

    return data?.dismissed || false;
  },

  async saveUserPreferences(preferences: Record<string, any>): Promise<void> {
    const userId = getUserId();

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving user preferences:', error);
    }
  },

  async getUserPreferences(): Promise<Record<string, any>> {
    const userId = getUserId();

    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return {};
    }

    return data?.preferences || {};
  }
};
