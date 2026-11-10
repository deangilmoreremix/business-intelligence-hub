import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GlassCard } from './GlassCard';
import { ModernButton } from './ModernButton';

interface SupabaseStatusProps {
  onSetupClick?: () => void;
  showDetails?: boolean;
}

export const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ 
  onSetupClick, 
  showDetails = false 
}) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'setup-needed'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      setStatus('checking');
      setError(null);

      // Check if environment variables exist
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setStatus('setup-needed');
        setError('Supabase environment variables not configured');
        return;
      }

      // Test connection by trying to read from app_content table
      const { error: dbError, count } = await supabase
        .from('app_content')
        .select('*', { count: 'exact', head: true });

      if (dbError) {
        if (dbError.code === '42P01') {
          setStatus('setup-needed');
          setError('app_content table does not exist');
        } else {
          setStatus('error');
          setError(dbError.message);
        }
        return;
      }

      setStatus('connected');
      setConnectionDetails({ recordCount: count });
    } catch (error) {
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Unknown connection error');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
      case 'setup-needed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
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
      case 'checking': return 'Checking connection...';
      case 'connected': return 'Connected to Supabase';
      case 'error': return 'Connection error';
      case 'setup-needed': return 'Setup required';
      default: return 'Unknown status';
    }
  };

  if (!showDetails && status === 'connected') {
    return null; // Hide when connected and details not requested
  }

  return (
    <GlassCard className={`border ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Supabase Storage</h3>
            <Database className="w-4 h-4 text-gray-600 dark:text-gray-500" />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {getStatusText()}
          </p>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">
              {error}
            </p>
          )}

          {status === 'setup-needed' && (
            <div className="space-y-2">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Connect to Supabase to save your settings and analytics data.
              </p>
              {onSetupClick && (
                <ModernButton onClick={onSetupClick} size="sm" variant="primary">
                  Connect to Supabase
                </ModernButton>
              )}
            </div>
          )}

          {status === 'connected' && connectionDetails && showDetails && (
            <div className="text-sm text-green-700 dark:text-green-300">
              <p>✅ Database connected</p>
              <p>📊 {connectionDetails.recordCount || 0} records stored</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex gap-2">
              <ModernButton onClick={checkSupabaseConnection} size="sm" variant="outline">
                Retry Connection
              </ModernButton>
              {onSetupClick && (
                <ModernButton onClick={onSetupClick} size="sm" variant="primary">
                  Setup Supabase
                </ModernButton>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};