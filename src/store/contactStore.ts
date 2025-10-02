import { create } from 'zustand';
import { crmService } from '../services/crmService';
import { supabase } from '../lib/supabase';
import { getAvatarByIndex, getInitials } from '../utils/avatars';

export interface Contact {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  avatar?: string; // URL
  avatarSrc?: string; // Alias for avatar for consistency with provided code
  initials?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  crmStatus?: 'lead' | 'prospect' | 'customer' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

interface ContactState {
  contacts: { [key: string]: Contact };
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  removeContact: (contactId: string) => void;
  loadContactsFromSupabase: () => Promise<void>;
  syncFromCRM: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: {},
  isLoading: false,
  error: null,
  lastSyncTime: null,
  
  addContact: (contact) => set((state) => ({
    contacts: { ...state.contacts, [contact.id]: contact }
  })),
  
  updateContact: (contact) => set((state) => ({
    contacts: { ...state.contacts, [contact.id]: contact }
  })),
  
  removeContact: (contactId) => set((state) => {
    const newContacts = { ...state.contacts };
    delete newContacts[contactId];
    return { contacts: newContacts };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  loadContactsFromSupabase: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const contactsMap: { [key: string]: Contact } = {};
      
      data?.forEach((contactRow: any, index: number) => {
        const fullName = `${contactRow.first_name} ${contactRow.last_name}`.trim();
        
        contactsMap[contactRow.id] = {
          id: contactRow.id,
          name: fullName,
          firstName: contactRow.first_name,
          lastName: contactRow.last_name,
          email: contactRow.email,
          phone: contactRow.phone,
          company: contactRow.company,
          status: 'online', // Default status
          crmStatus: contactRow.status,
          avatar: getAvatarByIndex(index),
          avatarSrc: getAvatarByIndex(index),
          initials: getInitials(fullName),
          createdAt: contactRow.created_at,
          updatedAt: contactRow.updated_at
        };
      });
      set({ 
        contacts: contactsMap, 
        isLoading: false,
        lastSyncTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading contacts from Supabase:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load contacts',
        isLoading: false 
      });
    }
  },
  
  syncFromCRM: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await crmService.syncCRMData();
      
      if (result.success) {
        // Reload contacts from Supabase after successful sync
        await get().loadContactsFromSupabase();
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