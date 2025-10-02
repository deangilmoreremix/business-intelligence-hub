import React, { useState, useEffect } from 'react';
import { X, Database, Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { crmService, type CRMConfig } from '../../services/crmService';
import { ModernButton } from './ModernButton';
import { cn } from '../../lib/utils';

interface CRMSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CRMSetupModal: React.FC<CRMSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [config, setConfig] = useState<CRMConfig>({
    apiUrl: '',
    apiKey: '',
    customerId: '',
    syncEnabled: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadExistingConfig();
    }
  }, [isOpen]);

  const loadExistingConfig = async () => {
    try {
      const existingConfig = await crmService.loadCRMConfig();
      if (existingConfig) {
        setConfig(existingConfig);
      }
    } catch (error) {
      console.error('Error loading existing config:', error);
    }
  };

  const handleInputChange = (field: keyof CRMConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
    setError(null);
  };

  const testConnection = async () => {
    if (!config.apiUrl || !config.apiKey || !config.customerId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsTesting(true);
      setError(null);
      
      const isValid = await crmService.validateConnection(config);
      setTestResult(isValid ? 'success' : 'error');
      
      if (!isValid) {
        setError('Unable to connect to SmartCRM. Please check your credentials.');
      }
    } catch (error) {
      setTestResult('error');
      setError(error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!config.apiUrl || !config.apiKey || !config.customerId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const success = await crmService.initializeConnection(config);
      
      if (success) {
        onSuccess?.();
        onClose();
      } else {
        setError('Failed to save CRM configuration');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              SmartCRM Setup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {testResult === 'success' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Connection test successful! SmartCRM is reachable.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SmartCRM API URL
              </label>
              <input
                type="url"
                value={config.apiUrl}
                onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                placeholder="https://your-smartcrm.com"
                className={cn(
                  "w-full px-3 py-2 border rounded-lg transition-colors",
                  "border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700",
                  "text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="Enter your SmartCRM API key"
                className={cn(
                  "w-full px-3 py-2 border rounded-lg transition-colors",
                  "border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700",
                  "text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer ID
              </label>
              <input
                type="text"
                value={config.customerId}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
                placeholder="Your SmartCRM customer/tenant ID"
                className={cn(
                  "w-full px-3 py-2 border rounded-lg transition-colors",
                  "border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700",
                  "text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable automatic sync
              </label>
              <button
                onClick={() => handleInputChange('syncEnabled', !config.syncEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  config.syncEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                )}
                type="button"
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition",
                    config.syncEnabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Test Connection */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <ModernButton
              onClick={testConnection}
              variant="outline"
              loading={isTesting}
              disabled={!config.apiUrl || !config.apiKey || !config.customerId}
              className="w-full"
            >
              <TestTube className="w-4 h-4" />
              Test Connection
            </ModernButton>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <ModernButton
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </ModernButton>
          <ModernButton
            onClick={saveConfiguration}
            variant="primary"
            loading={isLoading}
            disabled={!config.apiUrl || !config.apiKey || !config.customerId}
            className="flex-1"
          >
            <Save className="w-4 h-4" />
            Save & Connect
          </ModernButton>
        </div>
      </div>
    </div>
  );
};