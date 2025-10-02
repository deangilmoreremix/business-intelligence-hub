// Common types used across the application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  contactId: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  createdAt: Date;
}

export interface KPIMetric {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'flat';
  period?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}