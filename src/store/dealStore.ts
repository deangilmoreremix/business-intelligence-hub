import { create } from 'zustand';
import { crmService } from '../services/crmService';
import { supabase } from '../lib/supabase';

export interface Deal {
  id: string;
  title: string;
  stage: string;
  value: number;
  contactId: string;
  probability?: number;
  assignedTo?: string;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface DealState {
  deals: { [key: string]: Deal };
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
  addDeal: (deal: Deal) => void;
  updateDeal: (deal: Deal) => void;
  removeDeal: (dealId: string) => void;
  loadDealsFromSupabase: () => Promise<void>;
  syncFromCRM: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDealStore = create<DealState>((set, get) => ({
  deals: {},
  isLoading: false,
  error: null,
  lastSyncTime: null,
  
  addDeal: (deal) => set((state) => ({
    deals: { ...state.deals, [deal.id]: deal }
  })),
  
  updateDeal: (deal) => set((state) => ({
    deals: { ...state.deals, [deal.id]: deal }
  })),
  
  removeDeal: (dealId) => set((state) => {
    const newDeals = { ...state.deals };
    delete newDeals[dealId];
    return { deals: newDeals };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  loadDealsFromSupabase: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const dealsMap: { [key: string]: Deal } = {};
      
      data?.forEach((dealRow: any) => {
        dealsMap[dealRow.id] = {
          id: dealRow.id,
          title: dealRow.title,
          stage: dealRow.status || 'open',
          value: dealRow.value || 0,
          contactId: dealRow.contact_id,
          probability: dealRow.probability,
          assignedTo: dealRow.assigned_to,
          expectedCloseDate: dealRow.expected_close_date,
          createdAt: dealRow.created_at,
          updatedAt: dealRow.updated_at
        };
      });
      set({ 
        deals: dealsMap, 
        isLoading: false,
        lastSyncTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading deals from Supabase:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load deals',
        isLoading: false 
      });
    }
  },
  
  syncFromCRM: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await crmService.syncCRMData();
      
      if (result.success) {
        // Reload deals from Supabase after successful sync
        await get().loadDealsFromSupabase();
        set({
          lastSyncTime: new Date().toISOString(),
          isLoading: false
        });
      } else {
        throw new Error('CRM sync failed');
      }
    } catch (error) {
      console.error('Error syncing from CRM:', error);
      set({ 
        error: error instanceof Error ? error.message : 'CRM sync failed',
        isLoading: false 
      });
    }
  }
}));