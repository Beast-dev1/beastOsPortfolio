'use client';

import { useMemo, useCallback } from 'react';
import { appConfig } from '@/config/apps';
import { useFileSystem, File } from '@/Context/FileSystemContext';

export interface DesktopIcon {
  id: string;
  name: string;
  icon?: string;
  type: 'app' | 'file' | 'folder';
  fileData?: File;
}

const GRID_SIZE = 80; // Grid size for icon positioning
const ICON_SPACING = 20; // Spacing between icons in grid
const DEFAULT_X = 20; // Default left margin
const DEFAULT_Y = 20; // Default top margin

export const useDesktopIcons = () => {
  const { getChildren } = useFileSystem();

  // Get desktop files (files with parentId === null)
  const desktopFiles = useMemo(() => getChildren(null), [getChildren]);

  // Combine apps and files into desktop icons
  const desktopIcons = useMemo((): DesktopIcon[] => {
    const icons: DesktopIcon[] = [];

    // Add taskbar apps
    appConfig.taskbarApps.forEach((app) => {
      icons.push({
        id: `app-${app.id}`,
        name: app.name,
        icon: app.icon,
        type: 'app',
      });
    });

    // Add desktop files/folders
    desktopFiles.forEach((file) => {
      icons.push({
        id: `file-${file.id}`,
        name: file.name,
        type: file.type === 'folder' ? 'folder' : 'file',
        fileData: file,
      });
    });

    return icons;
  }, [desktopFiles]);

  // Get saved position from localStorage
  const getIconPosition = useCallback((iconId: string): { x: number; y: number } => {
    if (typeof window === 'undefined') return { x: DEFAULT_X, y: DEFAULT_Y };
    
    const saved = localStorage.getItem(`desktop-icon-${iconId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: DEFAULT_X, y: DEFAULT_Y };
      }
    }
    return { x: DEFAULT_X, y: DEFAULT_Y };
  }, []);

  // Save icon position to localStorage
  const saveIconPosition = useCallback((iconId: string, x: number, y: number) => {
    if (typeof window === 'undefined') return;
    
    // Constrain to desktop bounds (excluding taskbar area)
    const maxX = window.innerWidth - GRID_SIZE - 20;
    const maxY = window.innerHeight - 120 - GRID_SIZE; // 120px for taskbar area
    
    const constrainedX = Math.max(DEFAULT_X, Math.min(maxX, x));
    const constrainedY = Math.max(DEFAULT_Y, Math.min(maxY, y));
    
    localStorage.setItem(
      `desktop-icon-${iconId}`,
      JSON.stringify({ x: constrainedX, y: constrainedY })
    );
  }, []);

  // Calculate default grid position for icon index
  const getDefaultGridPosition = useCallback((index: number): { x: number; y: number } => {
    const iconsPerRow = Math.floor((window.innerWidth - DEFAULT_X * 2) / (GRID_SIZE + ICON_SPACING));
    const row = Math.floor(index / iconsPerRow);
    const col = index % iconsPerRow;
    
    return {
      x: DEFAULT_X + col * (GRID_SIZE + ICON_SPACING),
      y: DEFAULT_Y + row * (GRID_SIZE + ICON_SPACING),
    };
  }, []);

  // Get position for icon (saved or default grid)
  const getPositionForIcon = useCallback((iconId: string, index: number): { x: number; y: number } => {
    const saved = getIconPosition(iconId);
    
    // If saved position is at default, use grid position
    if (saved.x === DEFAULT_X && saved.y === DEFAULT_Y) {
      return getDefaultGridPosition(index);
    }
    
    return saved;
  }, [getIconPosition, getDefaultGridPosition]);

  return {
    desktopIcons,
    getIconPosition,
    saveIconPosition,
    getPositionForIcon,
  };
};

