import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle, Loader2, Settings, FolderSync as Sync } from 'lucide-react';
import { crmService, type CRMConfig } from '../../services/crmService';
import { GlassCard } from './GlassCard';
import { ModernButton } from './ModernButton';
import { cn } from '../../lib/utils';

interface CRMConnectionStatusProps {
  onSetupClick?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const CRMConnectionStatus: React.FC<CRMConnectionStatusProps> = ({ 
  onSetupClick, 
  showDetails = false,
  className 
}) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'setup-needed'>('checking');
  const [config, setConfig] = useState<CRMConfig | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    checkCRMConnection();
  }, []);

  const checkCRMConnection = async () => {
    try {
      setIsLoading(true);
      setStatus('checking');

      const crmConfig = await crmService.loadCRMConfig();
      
      if (!crmConfig) {
        setStatus('setup-needed');
        return;
      }

      setConfig(crmConfig);
      setLastSync(crmConfig.lastSync || null);

      const isConnected = await crmService.testConnection();
      setStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      console.error('Error checking CRM connection:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!config) return;

    try {
      setIsSyncing(true);
      const result = await crmService.syncCRMData();
      
      if (result.success) {
        setLastSync(new Date().toISOString());
        // Show success message or update UI
        console.log(`Synced ${result.synced.deals} deals and ${result.synced.contacts} contacts`);
      } else {
        console.error('Sync failed');
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'setup-needed':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'setup-needed': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking': return 'Checking CRM connection...';
      case 'connected': return 'Connected to SmartCRM';
      case 'error': return 'CRM connection error';
      case 'setup-needed': return 'CRM setup required';
      default: return 'Unknown status';
    }
  };

  const formatLastSync = (syncTime: string | null) => {
    if (!syncTime) return 'Never';
    
    const date = new Date(syncTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!showDetails && status === 'connected') {
    return null; // Hide when connected and details not requested
  }

  return (
    <GlassCard className={cn(`border ${getStatusColor()}`, className)}>
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">SmartCRM Integration</h3>
            <Database className="w-4 h-4 text-gray-600 dark:text-gray-500" />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {getStatusText()}
          </p>

          {status === 'connected' && config && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last sync:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatLastSync(lastSync)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">API Endpoint:</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-32">
                  {config.apiUrl}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                <ModernButton 
                  onClick={handleSync} 
                  size="sm" 
                  variant="primary"
                  loading={isSyncing}
                  disabled={isSyncing}
                >
                  <Sync className="w-3 h-3" />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </ModernButton>
                
                <ModernButton 
                  onClick={onSetupClick} 
                  size="sm" 
                  variant="outline"
                >
                  <Settings className="w-3 h-3" />
                  Settings
                </ModernButton>
              </div>
            </div>
          )}

          {status === 'setup-needed' && (
            <div className="space-y-2">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Connect to SmartCRM to sync your deals and contacts data.
              </p>
              {onSetupClick && (
                <ModernButton onClick={onSetupClick} size="sm" variant="primary">
                  Connect to SmartCRM
                </ModernButton>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <p className="text-sm text-red-700 dark:text-red-300">
                Unable to connect to SmartCRM. Please check your configuration.
              </p>
              <div className="flex gap-2">
                <ModernButton onClick={checkCRMConnection} size="sm" variant="outline">
                  Retry Connection
                </ModernButton>
                {onSetupClick && (
                  <ModernButton onClick={onSetupClick} size="sm" variant="primary">
                    Update Settings
                  </ModernButton>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};