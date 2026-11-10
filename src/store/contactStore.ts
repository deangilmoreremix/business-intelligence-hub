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
  jobTitle?: string;
  city?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  website?: string;
  bio?: string;
  enrichedAt?: string;
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
  createContact: (input: Partial<Contact> & { firstName: string }) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<void>;
  loadContactsFromSupabase: () => Promise<void>;
  syncFromCRM: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useContactStore = create<ContactState>()((set, get) => ({
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
  
  createContact: async (input) => {
    const row = {
      first_name: input.firstName,
      last_name: input.lastName ?? '',
      email: input.email ?? null,
      phone: input.phone ?? null,
      company: input.company ?? null,
      status: input.crmStatus ?? 'lead',
    };
    const { data, error } = await supabase.from('contacts').insert(row).select().single();
    if (error || !data) {
      set({ error: error?.message ?? 'Failed to create contact' });
      return null;
    }
    await get().loadContactsFromSupabase();
    return get().contacts[data.id] ?? null;
  },

  deleteContact: async (id) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) { set({ error: error.message }); return; }
    get().removeContact(id);
  },

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
      
      data?.forEach((contactRow: Record<string, string | null> & { id: string }, index: number) => {
        const fullName = `${contactRow.first_name} ${contactRow.last_name}`.trim();
        
        contactsMap[contactRow.id] = {
          id: contactRow.id,
          name: fullName,
          firstName: contactRow.first_name ?? undefined,
          lastName: contactRow.last_name ?? undefined,
          email: contactRow.email ?? '',
          phone: contactRow.phone ?? undefined,
          company: contactRow.company ?? undefined,
          status: 'online', // Default status
          crmStatus: contactRow.status as Contact['crmStatus'],
          jobTitle: contactRow.job_title ?? undefined,
          city: contactRow.city ?? undefined,
          linkedinUrl: contactRow.linkedin_url ?? undefined,
          twitterUrl: contactRow.twitter_url ?? undefined,
          website: contactRow.website ?? undefined,
          bio: contactRow.bio ?? undefined,
          enrichedAt: contactRow.enriched_at ?? undefined,
          avatar: getAvatarByIndex(index),
          avatarSrc: getAvatarByIndex(index),
          initials: getInitials(fullName),
          createdAt: contactRow.created_at ?? undefined,
          updatedAt: contactRow.updated_at ?? undefined
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