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

const GRID_CELL_SIZE = 100; // Grid cell size (80px icon + 20px spacing)
const ICON_WIDTH = 80; // Icon width
const ICON_HEIGHT = 100; // Icon height (including label)
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
    const maxX = window.innerWidth - ICON_WIDTH - DEFAULT_X;
    const maxY = window.innerHeight - 120 - ICON_HEIGHT; // 120px for taskbar area
    
    const constrainedX = Math.max(DEFAULT_X, Math.min(maxX, x));
    const constrainedY = Math.max(DEFAULT_Y, Math.min(maxY, y));
    
    localStorage.setItem(
      `desktop-icon-${iconId}`,
      JSON.stringify({ x: constrainedX, y: constrainedY })
    );
  }, []);

  // Snap position to grid
  const snapToGrid = useCallback((x: number, y: number): { x: number; y: number } => {
    const gridX = Math.round((x - DEFAULT_X) / GRID_CELL_SIZE) * GRID_CELL_SIZE + DEFAULT_X;
    const gridY = Math.round((y - DEFAULT_Y) / GRID_CELL_SIZE) * GRID_CELL_SIZE + DEFAULT_Y;
    
    // Constrain to desktop bounds
    const maxX = typeof window !== 'undefined' 
      ? Math.floor((window.innerWidth - DEFAULT_X - ICON_WIDTH) / GRID_CELL_SIZE) * GRID_CELL_SIZE + DEFAULT_X
      : 1000;
    const maxY = typeof window !== 'undefined'
      ? Math.floor((window.innerHeight - 120 - ICON_HEIGHT) / GRID_CELL_SIZE) * GRID_CELL_SIZE + DEFAULT_Y
      : 800;
    
    return {
      x: Math.max(DEFAULT_X, Math.min(maxX, gridX)),
      y: Math.max(DEFAULT_Y, Math.min(maxY, gridY)),
    };
  }, []);

  // Check if a grid position is occupied
  const isPositionOccupied = useCallback((
    x: number, 
    y: number, 
    excludeId: string | null,
    allPositions: Map<string, { x: number; y: number }>
  ): boolean => {
    const threshold = GRID_CELL_SIZE / 2; // Consider occupied if within half grid cell
    
    for (const [iconId, pos] of Array.from(allPositions.entries())) {
      if (excludeId && iconId === excludeId) continue;
      
      const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
      if (distance < threshold) {
        return true;
      }
    }
    
    return false;
  }, []);

  // Find nearest available grid position
  const findNearestAvailablePosition = useCallback((
    startX: number,
    startY: number,
    excludeId: string | null,
    allPositions: Map<string, { x: number; y: number }>
  ): { x: number; y: number } => {
    const snapped = snapToGrid(startX, startY);
    
    // If snapped position is available, use it
    if (!isPositionOccupied(snapped.x, snapped.y, excludeId, allPositions)) {
      return snapped;
    }
    
    // Search in expanding spiral pattern
    const maxRadius = 10; // Maximum grid cells to search
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          // Only check positions on the edge of current radius
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          
          const candidateX = snapped.x + dx * GRID_CELL_SIZE;
          const candidateY = snapped.y + dy * GRID_CELL_SIZE;
          
          // Constrain to bounds
          const maxX = typeof window !== 'undefined' 
            ? window.innerWidth - DEFAULT_X - ICON_WIDTH
            : 1000;
          const maxY = typeof window !== 'undefined'
            ? window.innerHeight - 120 - ICON_HEIGHT
            : 800;
          
          if (candidateX < DEFAULT_X || candidateX > maxX) continue;
          if (candidateY < DEFAULT_Y || candidateY > maxY) continue;
          
          if (!isPositionOccupied(candidateX, candidateY, excludeId, allPositions)) {
            return { x: candidateX, y: candidateY };
          }
        }
      }
    }
    
    // Fallback: return snapped position even if occupied (shouldn't happen)
    return snapped;
  }, [snapToGrid, isPositionOccupied]);

  // Calculate default grid position for icon index
  const getDefaultGridPosition = useCallback((index: number): { x: number; y: number } => {
    const iconsPerRow = typeof window !== 'undefined'
      ? Math.floor((window.innerWidth - DEFAULT_X * 2) / GRID_CELL_SIZE)
      : 10;
    const row = Math.floor(index / iconsPerRow);
    const col = index % iconsPerRow;
    
    return {
      x: DEFAULT_X + col * GRID_CELL_SIZE,
      y: DEFAULT_Y + row * GRID_CELL_SIZE,
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
    snapToGrid,
    isPositionOccupied,
    findNearestAvailablePosition,
    GRID_CELL_SIZE,
    ICON_WIDTH,
    ICON_HEIGHT,
  };
};


