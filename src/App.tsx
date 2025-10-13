import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { AppRoute } from './components/AppRoute';
import { remoteCommunicator } from './utils/RemoteCommunicator';

function App() {
  useEffect(() => {
    remoteCommunicator.notifyReady();
    console.log('✅ Analytics App initialized and ready');

    const handleDataSync = (_type: string, data: any) => {
      console.log('📊 Received initial data sync from host:', data);
    };

    remoteCommunicator.on('INITIAL_DATA_SYNC', handleDataSync);
    remoteCommunicator.on('CRM_READY', (_type: string) => {
      console.log('✅ Host CRM is ready for communication');
    });

    return () => {
      remoteCommunicator.off('INITIAL_DATA_SYNC', handleDataSync);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/app/:appId" element={<AppRoute />} />
    </Routes>
  );
}

export default App;