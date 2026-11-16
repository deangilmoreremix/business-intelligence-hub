import { hostAuthHeaders } from '../lib/hostAuth';

const CRM_URL: string = import.meta.env.VITE_CRM_FUNCTION_URL || '/.netlify/functions/crm';

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
  /** Non-secret view of the connection. The API key lives on the server only; `apiKey` here is always ''. */
  private config: CRMConfig | null = null;

  private async call<T = any>(action: string, config?: Partial<CRMConfig>): Promise<T> {
    const res = await fetch(CRM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...hostAuthHeaders() },
      body: JSON.stringify({ action, config }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || res.statusText);
    return json as T;
  }

  private fromServer(c: any): CRMConfig | null {
    return c ? { apiUrl: c.apiUrl, apiKey: '', customerId: c.customerId, syncEnabled: c.syncEnabled, lastSync: c.lastSync } : null;
  }

  /** Validates the connection and stores it (including the key) on the server. */
  async initializeConnection(config: CRMConfig): Promise<boolean> {
    try {
      const r = await this.call<{ connection: unknown }>('connect', config);
      this.config = this.fromServer(r.connection);
      return true;
    } catch (error) {
      console.error('Failed to initialize CRM connection:', error);
      return false;
    }
  }

  async validateConnection(config: CRMConfig): Promise<boolean> {
    try {
      await this.call('test', config);
      return true;
    } catch (error) {
      console.error('CRM connection validation failed:', error);
      return false;
    }
  }

  async fetchDeals(): Promise<CRMDeal[]> {
    return (await this.call<{ deals: CRMDeal[] }>('fetch')).deals ?? [];
  }

  async fetchContacts(): Promise<CRMContact[]> {
    return (await this.call<{ contacts: CRMContact[] }>('fetch')).contacts ?? [];
  }

  /** Server-side sync: fetches from the CRM and upserts contacts/deals for this tenant (idempotent). */
  async syncCRMData(): Promise<{ success: boolean; synced: { deals: number; contacts: number } }> {
    try {
      const r = await this.call<{ synced: { deals: number; contacts: number }; lastSync: string }>('sync');
      if (this.config) this.config = { ...this.config, lastSync: r.lastSync };
      return { success: true, synced: r.synced };
    } catch (error) {
      console.error('CRM sync failed:', error);
      return { success: false, synced: { deals: 0, contacts: 0 } };
    }
  }

  async loadCRMConfig(): Promise<CRMConfig | null> {
    try {
      const r = await this.call<{ connection: unknown }>('status');
      this.config = this.fromServer(r.connection);
      return this.config;
    } catch (error) {
      console.error('Failed to load CRM configuration:', error);
      return null;
    }
  }

  getConnectionStatus(): { connected: boolean; lastSync?: string; config?: CRMConfig } {
    return { connected: this.config !== null, lastSync: this.config?.lastSync, config: this.config ?? undefined };
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.call('disconnect');
      this.config = null;
      return true;
    } catch (error) {
      console.error('Failed to disconnect from CRM:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) return false;
    try {
      await this.call('test', {});
      return true;
    } catch {
      return false;
    }
  }
}

export const crmService = new CRMService();