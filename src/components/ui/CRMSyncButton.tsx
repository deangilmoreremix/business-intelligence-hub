import React, { useState } from 'react';
import { FolderSync as Sync, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ModernButton } from './ModernButton';
import { useCRMIntegration } from '../../hooks/useCRMIntegration';
import { cn } from '../../lib/utils';
import { Tooltip } from './Tooltip';
import { tooltipContent } from '../../data/tooltipContent';

interface CRMSyncButtonProps {
  onSyncComplete?: (success: boolean, data?: any) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
}

export const CRMSyncButton: React.FC<CRMSyncButtonProps> = ({
  onSyncComplete,
  className,
  size = 'md',
  variant = 'outline'
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<'success' | 'error' | null>(null);
  const { isConnected, syncData, lastSync } = useCRMIntegration();

  const handleSync = async () => {
    if (!isConnected) {
      return;
    }

    try {
      setIsSyncing(true);
      setLastSyncResult(null);
      
      const success = await syncData();
      setLastSyncResult(success ? 'success' : 'error');
      
      onSyncComplete?.(success);
      
      // Clear result indicator after 3 seconds
      setTimeout(() => setLastSyncResult(null), 3000);
    } catch (error) {
      setLastSyncResult('error');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getResultIcon = () => {
    if (isSyncing) return <Sync className="w-4 h-4 animate-spin" />;
    if (lastSyncResult === 'success') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (lastSyncResult === 'error') return <XCircle className="w-4 h-4 text-red-600" />;
    return <Sync className="w-4 h-4" />;
  };

  const getButtonText = () => {
    if (isSyncing) return 'Syncing...';
    if (lastSyncResult === 'success') return 'Synced';
    if (lastSyncResult === 'error') return 'Sync Failed';
    return 'Sync CRM';
  };

  const getTooltipText = () => {
    if (isSyncing) return tooltipContent.buttons.crmSyncing;
    if (lastSyncResult === 'success') return tooltipContent.buttons.crmSyncSuccess;
    if (lastSyncResult === 'error') return tooltipContent.buttons.crmSyncError;
    return tooltipContent.buttons.crmSync;
  };

  const getButtonVariant = () => {
    if (lastSyncResult === 'success') return 'ghost';
    if (lastSyncResult === 'error') return 'outline';
    return variant;
  };

  if (!isConnected) {
    return null; // Don't show if CRM is not connected
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Tooltip content={getTooltipText()} position="top">
        <ModernButton
          onClick={handleSync}
          variant={getButtonVariant()}
          size={size}
          loading={isSyncing}
          disabled={isSyncing}
          className={cn(
            lastSyncResult === 'success' && 'text-green-600 border-green-300',
            lastSyncResult === 'error' && 'text-red-600 border-red-300'
          )}
        >
          {getResultIcon()}
          {getButtonText()}
        </ModernButton>
      </Tooltip>
      
      {lastSync && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(lastSync).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};