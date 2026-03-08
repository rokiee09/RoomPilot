import {
  IconArticle,
  IconBriefcase,
  IconBuildingStore,
  IconCalendarEvent,
  IconLayoutDashboard,
  IconMapPin,
  IconPackages,
  IconPackage,
  IconUserCog,
  IconUsers,
  IconBedFilled,
  IconChartBar,
  IconHistory,
  IconSettings,
} from '@tabler/icons-react';
import type { SidebarData } from '../types';

export const companySidebarData: SidebarData = {
  navGroups: [
    {
      title: 'RoomPilot',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: IconLayoutDashboard },
        { title: 'İşletmeler', url: '/entities', icon: IconBuildingStore },
        { title: 'Bölgeler', url: '/sites', icon: IconMapPin },
        { title: 'Rezervasyonlar', url: '/reservations', icon: IconCalendarEvent },
        { title: 'Doluluk', url: '/availability', icon: IconBedFilled },
        { title: 'Müşteriler', url: '/customers', icon: IconUsers },
        { title: 'Ödemeler', url: '/payments', icon: IconPackages },
        { title: 'Stok / Envanter', url: '/stock', icon: IconPackage },
        { title: 'Reports', url: '/reports', icon: IconChartBar },
        { title: 'Activity Log', url: '/audit-logs', icon: IconHistory },
        { title: 'Settings', url: '/demo/settings', icon: IconSettings },
      ],
    },
    {
      title: 'Company Management',
      items: [
        {
          title: 'Company Members',
          url: '/company-members',
          icon: IconUsers,
        },
        {
          title: 'Company Roles',
          url: '/company-roles',
          icon: IconUserCog,
        },
        {
          title: 'Projects',
          url: '/projects',
          icon: IconBriefcase,
        },
        {
          title: 'Posts',
          url: '/posts',
          icon: IconArticle,
        },
      ],
    },
  ],
};