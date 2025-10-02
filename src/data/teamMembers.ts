import { getAvatarByIndex, getInitials } from '../utils/avatars';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string; // Now a URL
  avatarSrc?: string; // Alias for avatar for consistency
  initials?: string; // New
  status: 'online' | 'offline' | 'away' | 'busy';
  performance?: number;
  deals?: number;
  revenue?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Sales Manager',
    status: 'online',
    performance: 92,
    deals: 34,
    revenue: '$450K'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Account Executive',
    status: 'online',
    performance: 87,
    deals: 28,
    revenue: '$320K'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Business Development Rep',
    status: 'away',
    performance: 94,
    deals: 42,
    revenue: '$580K'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Sales Director',
    status: 'online',
    performance: 96,
    deals: 18,
    revenue: '$890K'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    role: 'Customer Success Manager',
    status: 'busy',
    performance: 89,
    deals: 25,
    revenue: '$380K'
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Sales Analyst',
    status: 'online',
    performance: 85,
    deals: 15,
    revenue: '$220K'
  }
];

// Enhance team members with avatars and initials
teamMembers.forEach((member, index) => {
  member.avatar = getAvatarByIndex(index);
  member.avatarSrc = member.avatar; // For compatibility
  member.initials = getInitials(member.name);
});