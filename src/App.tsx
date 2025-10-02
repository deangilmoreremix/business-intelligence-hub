import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { AppRoute } from './components/AppRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/app/:appId" element={<AppRoute />} />
    </Routes>
  );
}

export default App;