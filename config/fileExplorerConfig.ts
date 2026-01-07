import { appConfig } from './apps';

export interface QuickAccessItem {
  id: string;
  name: string;
  icon: string;
  type: 'folder' | 'app' | 'drive';
  path?: string;
  location?: string;
  pinned?: boolean;
}

export interface PinnedNavItem {
  id: string;
  name: string;
  icon: string;
  type: 'folder' | 'drive' | 'section';
  path?: string;
  pinned?: boolean;
}

export const fileExplorerConfig = {
  quickAccessItems: [
    // Standard Windows folders
    {
      id: 'desktop',
      name: 'Desktop',
      icon: 'folder',
      type: 'folder' as const,
      path: 'Desktop',
      location: 'Stored locally',
      pinned: true,
    },
    {
      id: 'downloads',
      name: 'Downloads',
      icon: 'folder',
      type: 'folder' as const,
      path: 'Downloads',
      location: 'Stored locally',
      pinned: true,
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: 'folder',
      type: 'folder' as const,
      path: 'Documents',
      location: 'Stored locally',
      pinned: true,
    },
    {
      id: 'pictures',
      name: 'Pictures',
      icon: 'folder',
      type: 'folder' as const,
      path: 'Pictures',
      location: 'Stored locally',
      pinned: true,
    },
    {
      id: 'music',
      name: 'Music',
      icon: 'folder',
      type: 'folder' as const,
      path: 'Music',
      location: 'Stored locally',
      pinned: true,
    },
    {
      id: 'videos',
      name: 'Videos',
      icon: 'folder',
      type: 'folder' as const,
      path: 'Videos',
      location: 'Stored locally',
      pinned: true,
    },
 
    // Portfolio apps as shortcuts
    ...appConfig.taskbarApps
      .filter((app) => app.id !== 'FileExplorer')
      .map((app) => ({
        id: app.id,
        name: app.name,
        icon: app.icon,
        type: 'app' as const,
        pinned: true,
      })),
  ] as QuickAccessItem[],

  pinnedNavItems: [
    {
      id: 'desktop',
      name: 'Desktop',
      icon: 'folder',
      type: 'folder' as const,
      pinned: true,
    },
    {
      id: 'downloads',
      name: 'Downloads',
      icon: 'folder',
      type: 'folder' as const,
      pinned: true,
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: 'folder',
      type: 'folder' as const,
      pinned: true,
    },
    {
      id: 'pictures',
      name: 'Pictures',
      icon: 'folder',
      type: 'folder' as const,
      pinned: true,
    },
    {
      id: 'music',
      name: 'Music',
      icon: 'folder',
      type: 'folder' as const,
      pinned: true,
    },
    {
      id: 'videos',
      name: 'Videos',
      icon: 'folder',
      type: 'folder' as const,
      pinned: true,
    },
  ] as PinnedNavItem[],
};



