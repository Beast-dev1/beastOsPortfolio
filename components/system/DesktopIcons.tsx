'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDesktopIcons, DesktopIcon } from '@/hooks/useDesktopIcons';
import DesktopIconItem from './DesktopIconItem';
import { useWindowContext } from '@/Context/windowContext';
import { useFileSystem } from '@/Context/FileSystemContext';
import { appConfig } from '@/config/apps';
import Terminal from './Terminal';
import FileExplorer from './FileExplorer';
import Chrome from './Chrome';
import Photos from './Photos';

export default function DesktopIcons() {
  const { 
    desktopIcons, 
    getPositionForIcon, 
    saveIconPosition,
    findNearestAvailablePosition,
    snapToGrid,
  } = useDesktopIcons();
  const { addWindow, windows, restoreWindow, setWindowState, bringToFront } = useWindowContext();
  const { setCurrentDirectory } = useFileSystem();
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Initialize icon positions with collision detection
  useEffect(() => {
    const positions = new Map<string, { x: number; y: number }>();
    desktopIcons.forEach((icon, index) => {
      const defaultPos = getPositionForIcon(icon.id, index);
      // Find nearest available position to avoid overlaps
      const finalPos = findNearestAvailablePosition(
        defaultPos.x,
        defaultPos.y,
        icon.id,
        positions
      );
      positions.set(icon.id, finalPos);
      // Save to localStorage if it's different from default
      if (finalPos.x !== defaultPos.x || finalPos.y !== defaultPos.y) {
        saveIconPosition(icon.id, finalPos.x, finalPos.y);
      }
    });
    setIconPositions(positions);
  }, [desktopIcons, getPositionForIcon, findNearestAvailablePosition, saveIconPosition]);

  // Handle icon position change with collision detection
  const handlePositionChange = useCallback(
    (iconId: string, x: number, y: number) => {
      // Snap to grid first
      const snapped = snapToGrid(x, y);
      
      // Find nearest available position (handles collision detection)
      const finalPosition = findNearestAvailablePosition(
        snapped.x,
        snapped.y,
        iconId,
        iconPositions
      );
      
      // Save the final position
      saveIconPosition(iconId, finalPosition.x, finalPosition.y);
      setIconPositions((prev) => {
        const newMap = new Map(prev);
        newMap.set(iconId, finalPosition);
        return newMap;
      });
    },
    [saveIconPosition, snapToGrid, findNearestAvailablePosition, iconPositions]
  );

  // Handle app launch (reuse Taskbar logic)
  const handleAppLaunch = useCallback(
    (appId: string) => {
      const window = windows.find((w) => w.id === appId);

      if (window) {
        if (window.isMinimized) {
          restoreWindow(appId);
        } else {
          setWindowState(appId, { isVisible: true });
          bringToFront(appId);
        }
      } else {
        // Get app icon
        const app = appConfig.taskbarApps.find((app) => app.id === appId);
        const appIcon = app?.icon || '';

        // Handle specific apps
        if (appId === 'Terminal') {
          addWindow(appId, <Terminal />, 800, 500, appIcon);
          return;
        }

        if (appId === 'FileExplorer') {
          addWindow(appId, <FileExplorer />, 1000, 700, appIcon);
          return;
        }

        if (appId === 'GoogleChrome') {
          addWindow(appId, <Chrome />, 1200, 800, appIcon);
          return;
        }

        if (appId === 'Photos') {
          addWindow(appId, <Photos />, 1000, 700, appIcon);
          return;
        }

        // Default placeholder for other apps
        addWindow(
          appId,
          <div className="p-4 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{app?.name || appId}</h2>
              <p className="text-sm text-gray-500">App component coming soon</p>
            </div>
          </div>,
          800,
          600,
          appIcon
        );
      }
    },
    [windows, addWindow, restoreWindow, setWindowState, bringToFront]
  );

  // Handle folder open
  const handleFolderOpen = useCallback(
    (folderId: string) => {
      // Check if File Explorer is already open
      const fileExplorerWindow = windows.find((w) => w.id === 'FileExplorer');

      if (fileExplorerWindow) {
        // If File Explorer is minimized, restore it
        if (fileExplorerWindow.isMinimized) {
          restoreWindow('FileExplorer');
        }
        // Bring to front and navigate to folder
        bringToFront('FileExplorer');
        setCurrentDirectory(folderId);
      } else {
        // Open new File Explorer window at the folder
        const appIcon = '/cursor/file-part-2-svgrepo-com.svg';
        addWindow('FileExplorer', <FileExplorer />, 1000, 700, appIcon);
        // Navigate to folder after a small delay to ensure FileExplorer is mounted
        setTimeout(() => {
          setCurrentDirectory(folderId);
        }, 100);
      }
    },
    [windows, addWindow, restoreWindow, bringToFront, setCurrentDirectory]
  );

  // Handle file open
  const handleFileOpen = useCallback(
    (file: any) => {
      // For now, open File Explorer at the file's parent folder
      // This can be extended to open file viewers based on file type
      const parentId = file.parentId || null;
      
      const fileExplorerWindow = windows.find((w) => w.id === 'FileExplorer');
      if (fileExplorerWindow) {
        if (fileExplorerWindow.isMinimized) {
          restoreWindow('FileExplorer');
        }
        bringToFront('FileExplorer');
        setCurrentDirectory(parentId);
      } else {
        const appIcon = '/cursor/file-part-2-svgrepo-com.svg';
        addWindow('FileExplorer', <FileExplorer />, 1000, 700, appIcon);
        setTimeout(() => {
          setCurrentDirectory(parentId);
        }, 100);
      }
    },
    [windows, addWindow, restoreWindow, bringToFront, setCurrentDirectory]
  );

  // Handle icon double click (launch app or open file/folder)
  const handleIconDoubleClick = useCallback(
    (icon: DesktopIcon) => {
      if (icon.type === 'app') {
        // Extract app ID from icon ID (format: app-{appId})
        const appId = icon.id.replace('app-', '');
        handleAppLaunch(appId);
      } else if (icon.type === 'folder' && icon.fileData) {
        // Open folder in File Explorer
        handleFolderOpen(icon.fileData.id);
      } else if (icon.type === 'file' && icon.fileData) {
        // Open file (for now, just open File Explorer - can be extended)
        handleFileOpen(icon.fileData);
      }
    },
    [handleAppLaunch, handleFolderOpen, handleFileOpen]
  );

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.desktop-icon-item')) {
        setSelectedIconId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 z-[1]" style={{ paddingBottom: '48px' }}>
      <div className="absolute inset-0 pointer-events-none">
        {desktopIcons.map((icon, index) => {
          const position = iconPositions.get(icon.id) || getPositionForIcon(icon.id, index);
          
          return (
            <DesktopIconItem
              key={icon.id}
              icon={icon}
              position={position}
              isSelected={selectedIconId === icon.id}
              onSelect={setSelectedIconId}
              onDoubleClick={handleIconDoubleClick}
              onPositionChange={handlePositionChange}
              allIconPositions={iconPositions}
            />
          );
        })}
      </div>
    </div>
  );
}
