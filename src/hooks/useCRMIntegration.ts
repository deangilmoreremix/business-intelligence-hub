import { useState, useEffect, useCallback } from 'react';
import { crmService, type CRMConfig } from '../services/crmService';
import { useDealStore } from '../store/dealStore';
import { useContactStore } from '../store/contactStore';

export interface CRMIntegrationState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  config: CRMConfig | null;
  lastSync: string | null;
}

export function useCRMIntegration() {
  const [state, setState] = useState<CRMIntegrationState>({
    isConnected: false,
    isLoading: true,
    error: null,
    config: null,
    lastSync: null
  });

  const dealStore = useDealStore();
  const contactStore = useContactStore();

  // Load CRM configuration on mount
  useEffect(() => {
    loadCRMConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
  }, []);

  const loadCRMConfiguration = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const config = await crmService.loadCRMConfig();
      
      if (config) {
        const isConnected = await crmService.testConnection();
        setState(prev => ({
          ...prev,
          isConnected,
          config,
          lastSync: config.lastSync || null,
          isLoading: false
        }));

        // If connected, load data from Supabase
        if (isConnected) {
          await Promise.all([
            dealStore.loadDealsFromSupabase(),
            contactStore.loadContactsFromSupabase()
          ]);
        }
      } else {
        setState(prev => ({
          ...prev,
          isConnected: false,
          config: null,
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load CRM configuration',
        isLoading: false
      }));
    }
  };

  const connectToCRM = async (config: CRMConfig): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await crmService.initializeConnection(config);
      
      if (success) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          config,
          isLoading: false
        }));

        // Initial sync after connection
        await syncData();
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: 'Failed to connect to SmartCRM',
          isLoading: false
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed',
        isLoading: false
      }));
      return false;
    }
  };

  const syncData = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Sync both deals and contacts
      await Promise.all([
        dealStore.syncFromCRM(),
        contactStore.syncFromCRM()
      ]);

      setState(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        isLoading: false
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed',
        isLoading: false
      }));
      return false;
    }
  };

  const disconnect = async (): Promise<boolean> => {
    try {
      const success = await crmService.disconnect();
      
      if (success) {
        setState(prev => ({
          ...prev,
          isConnected: false,
          config: null,
          lastSync: null
        }));
      }
      
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Disconnect failed'
      }));
      return false;
    }
  };

  const testConnection = useCallback(async (config?: CRMConfig): Promise<boolean> => {
    const configToTest = config || state.config;
    
    if (!configToTest) {
      return false;
    }

    try {
      return await crmService.validateConnection(configToTest);
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }, [state.config]);

  return {
    ...state,
    connectToCRM,
    syncData,
    disconnect,
    testConnection,
    refresh: loadCRMConfiguration
  };
}