import {
  IconArticle,
  IconBuilding,
  IconBuildingStore,
  IconCalendarEvent,
  IconChartBar,
  IconChecklist,
  IconFiles,
  IconHelp,
  IconHistory,
  IconLayoutDashboard,
  IconMapPin,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconSettings,
  IconShield,
  IconTool,
  IconUserCog,
  IconUsers,
  IconBrowserCheck,
} from '@tabler/icons-react';
import type { SidebarData } from '../types';

export const systemAdminSidebarData: SidebarData = {
  navGroups: [
    {
      title: 'RoomPilot',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: IconLayoutDashboard,
        },
        {
          title: 'İşletmeler',
          url: '/entities',
          icon: IconBuildingStore,
        },
        {
          title: 'Bölgeler (Ana Siteler)',
          url: '/sites',
          icon: IconMapPin,
        },
        {
          title: 'Rezervasyonlar',
          url: '/reservations',
          icon: IconCalendarEvent,
        },
        {
          title: 'Müşteriler',
          url: '/customers',
          icon: IconUsers,
        },
        {
          title: 'Ödemeler',
          url: '/payments',
          icon: IconPackages,
        },
        {
          title: 'Raporlar',
          url: '/reports',
          icon: IconChartBar,
        },
        {
          title: 'Bildirim şablonları',
          url: '/settings/notification-templates',
          icon: IconNotification,
        },
      ],
    },
    {
      title: 'System Administration',
      items: [
        {
          title: 'Companies',
          url: '/companies',
          icon: IconBuilding,
        },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
        {
          title: 'Posts',
          url: '/posts',
          icon: IconArticle,
        },
        {
          title: 'Global Roles',
          url: '/global-roles',
          icon: IconShield,
        },
        {
          title: 'Audit Logs',
          url: '/audit-logs',
          icon: IconHistory,
        },
        {
          title: 'Locations',
          url: '/locations',
          icon: IconMapPin,
        },
        {
          title: 'File Library',
          url: '/file-library',
          icon: IconFiles,
        },
      ],
    },
    {
      title: 'DEMO',
      items: [
        {
          title: 'Tasks',
          url: '/demo/tasks',
          icon: IconChecklist,
        },
        {
          title: 'Apps',
          url: '/demo/apps',
          icon: IconPackages,
        },
        {
          title: 'Chats',
          url: '/demo/chats',
          icon: IconMessages,
        },
        {
          title: 'Users',
          url: '/demo/users',
          icon: IconUsers,
        },
        {
          title: 'Ayarlar',
          icon: IconSettings,
          items: [
            {
              title: 'Profil',
              url: '/demo/settings',
              icon: IconUserCog,
            },
            {
              title: 'Hesap',
              url: '/demo/settings/account',
              icon: IconTool,
            },
            {
              title: 'Tema / Görünüm',
              url: '/demo/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Bildirimler',
              url: '/demo/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Ekran',
              url: '/demo/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/demo/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
};