import { supabase } from '../lib/supabase';

export interface CRMConfig {
  apiUrl: string;
  apiKey: string;
  customerId: string;
  syncEnabled: boolean;
  lastSync?: string;
}

export interface CRMDeal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  contactId: string;
  assignedTo?: string;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

class CRMService {
  private config: CRMConfig | null = null;

  /**
   * Initialize CRM connection with configuration
   */
  async initializeConnection(config: CRMConfig): Promise<boolean> {
    try {
      // Validate connection
      const isValid = await this.validateConnection(config);
      if (!isValid) {
        throw new Error('Invalid CRM configuration');
      }

      // Save configuration to Supabase
      await this.saveCRMConfig(config);
      this.config = config;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize CRM connection:', error);
      return false;
    }
  }

  /**
   * Validate CRM API connection
   */
  async validateConnection(config: CRMConfig): Promise<boolean> {
    try {
      const response = await fetch(`${config.apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Customer-ID': config.customerId
        }
      });

      return response.ok;
    } catch (error) {
      console.error('CRM connection validation failed:', error);
      return false;
    }
  }

  /**
   * Fetch deals from SmartCRM
   */
  async fetchDeals(): Promise<CRMDeal[]> {
    if (!this.config) {
      throw new Error('CRM not configured');
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/api/deals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Customer-ID': this.config.customerId
        }
      });

      if (!response.ok) {
        throw new Error(`CRM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.deals || [];
    } catch (error) {
      console.error('Failed to fetch deals from CRM:', error);
      throw error;
    }
  }

  /**
   * Fetch contacts from SmartCRM
   */
  async fetchContacts(): Promise<CRMContact[]> {
    if (!this.config) {
      throw new Error('CRM not configured');
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/api/contacts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Customer-ID': this.config.customerId
        }
      });

      if (!response.ok) {
        throw new Error(`CRM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.contacts || [];
    } catch (error) {
      console.error('Failed to fetch contacts from CRM:', error);
      throw error;
    }
  }

  /**
   * Sync data from SmartCRM to local database
   */
  async syncCRMData(): Promise<{ success: boolean; synced: { deals: number; contacts: number } }> {
    if (!this.config) {
      throw new Error('CRM not configured');
    }

    try {
      // Fetch data from CRM
      const [crmDeals, crmContacts] = await Promise.all([
        this.fetchDeals(),
        this.fetchContacts()
      ]);

      // Convert and store contacts
      const contactsToStore = crmContacts.map(contact => ({
        id: contact.id,
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        status: contact.status,
        created_at: contact.createdAt,
        updated_at: contact.updatedAt
      }));

      // Convert and store deals
      const dealsToStore = crmDeals.map(deal => ({
        id: deal.id,
        title: deal.title,
        value: deal.value,
        stage_id: deal.stage, // Will need stage mapping
        probability: deal.probability,
        contact_id: deal.contactId,
        assigned_to: deal.assignedTo,
        expected_close_date: deal.expectedCloseDate,
        created_at: deal.createdAt,
        updated_at: deal.updatedAt
      }));

      // Batch insert/update to Supabase
      const contactResults = await supabase
        .from('contacts')
        .upsert(contactsToStore, { onConflict: 'id' });

      if (contactResults.error) {
        console.error('Error syncing contacts:', contactResults.error);
      }

      const dealResults = await supabase
        .from('deals')
        .upsert(dealsToStore, { onConflict: 'id' });

      if (dealResults.error) {
        console.error('Error syncing deals:', dealResults.error);
      }

      // Update last sync time
      const updatedConfig = { ...this.config, lastSync: new Date().toISOString() };
      await this.saveCRMConfig(updatedConfig);
      this.config = updatedConfig;

      return {
        success: true,
        synced: {
          deals: crmDeals.length,
          contacts: crmContacts.length
        }
      };
    } catch (error) {
      console.error('CRM sync failed:', error);
      return {
        success: false,
        synced: { deals: 0, contacts: 0 }
      };
    }
  }

  /**
   * Save CRM configuration to Supabase
   */
  private async saveCRMConfig(config: CRMConfig): Promise<void> {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'crm_config',
          setting_value: config,
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key,user_id' });

      if (error) {
        console.error('Error saving CRM config:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save CRM configuration:', error);
      throw error;
    }
  }

  /**
   * Load CRM configuration from Supabase
   */
  async loadCRMConfig(): Promise<CRMConfig | null> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'crm_config')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading CRM config:', error);
        return null;
      }

      if (data) {
        this.config = data.setting_value as CRMConfig;
        return this.config;
      }

      return null;
    } catch (error) {
      console.error('Failed to load CRM configuration:', error);
      return null;
    }
  }

  /**
   * Get current CRM connection status
   */
  getConnectionStatus(): { connected: boolean; lastSync?: string; config?: CRMConfig } {
    return {
      connected: this.config !== null,
      lastSync: this.config?.lastSync,
      config: this.config
    };
  }

  /**
   * Disconnect from CRM
   */
  async disconnect(): Promise<boolean> {
    try {
      await supabase
        .from('app_settings')
        .delete()
        .eq('setting_key', 'crm_config');

      this.config = null;
      return true;
    } catch (error) {
      console.error('Failed to disconnect from CRM:', error);
      return false;
    }
  }

  /**
   * Test CRM connection with current config
   */
  async testConnection(): Promise<boolean> {
    if (!this.config) {
      return false;
    }
    return await this.validateConnection(this.config);
  }
}

export const crmService = new CRMService();