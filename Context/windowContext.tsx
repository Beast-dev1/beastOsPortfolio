'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Window {
  id: string;
  title?: string;
  icon: string;
  width: number | string;
  height: number | string;
  x: number;
  y: number;
  content?: React.ReactNode;
  zIndex: number;
  isVisible: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  previousSize?: { width: number; height: number };
  previousPosition?: { x: number; y: number };
}

interface WindowContextType {
  windows: Window[];
  addWindow: (
    id: string,
    content: React.ReactNode,
    width?: number,
    height?: number,
    icon?: string,
    title?: string
  ) => void;
  removeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  toggleWindowVisibility: (id: string) => void;
  setWindowState: (id: string, state: Partial<Window>) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);
const MAX_Z_INDEX = 1000;

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [windows, setWindows] = useState<Window[]>([]);
  const addWindow = useCallback(
    (
      id: string,
      content: React.ReactNode,
      width: number = 100,
      height: number = 300,
      icon: string = '',
      title?: string
    ) => {
      setWindows((prev) => {
        const windowExists = prev.some((window) => window.id === id);

        if (windowExists) {
          return prev; // Don't add a new window if it already exists
        }

        // Account for taskbar height (approximately 48px)
        const taskbarHeight = 48;
        const availableHeight = window.innerHeight - taskbarHeight;
        const availableWidth = window.innerWidth;

        // Calculate the center position
        let centerX = (availableWidth - width) / 2;
        let centerY = (availableHeight - height) / 2;

        // Ensure window doesn't go off-screen - constrain position but keep original size
        centerX = Math.max(0, Math.min(centerX, availableWidth - width));
        centerY = Math.max(0, Math.min(centerY, availableHeight - height));

        const others = prev.filter((w) => w.id !== id);
        const maxZIndex = Math.min(
          Math.max(...others.map((w) => w.zIndex), 0) + 1,
          MAX_Z_INDEX
        );

        return [
          ...prev,
          {
            id,
            title,
            isVisible: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: maxZIndex,
            width,
            height,
            x: centerX,
            y: centerY,
            icon,
            content,
          },
        ];
      });
    },
    []
  );

  const removeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((window) => window.id !== id));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const window = prev.find((w) => w.id === id);

      if (!window) return prev;
      const others = prev.filter((w) => w.id !== id);
      const maxZIndex = Math.min(
        Math.max(...others.map((w) => w.zIndex), 0) + 1,
        MAX_Z_INDEX
      );

      return [...others, { ...window, zIndex: maxZIndex }];
    });
  }, []);

  const toggleWindowVisibility = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((window) =>
        window.id === id ? { ...window, isVisible: !window.isVisible } : window
      )
    );
  }, []);

  const setWindowState = useCallback((id: string, state: Partial<Window>) => {
    setWindows((prev) =>
      prev.map((window) =>
        window.id === id ? { ...window, ...state } : window
      )
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((window) =>
        window.id === id
          ? {
              ...window,
              isMinimized: true,
              isVisible: false,
              previousSize: {
                width: window.width as number,
                height: window.height as number,
              },
              previousPosition: {
                x: window.x,
                y: window.y,
              },
            }
          : window
      )
    );
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((window) =>
        window.id === id
          ? {
              ...window,
              isMaximized: true,
              previousSize: {
                width: window.previousSize?.width || 500,
                height: window.previousSize?.height || 500,
              },
              previousPosition: {
                x: window.previousPosition?.x || 100,
                y: window.previousPosition?.y || 100,
              },
              width: '100%',
              height: '100%',
              x: 0,
              y: 0,
            }
          : window
      )
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;

        const taskbarHeight = 48;
        const availableHeight = window.innerHeight - taskbarHeight;
        const availableWidth = window.innerWidth;
        const restoreWidth = w.previousSize?.width || 500;
        const restoreHeight = w.previousSize?.height || 500;

        // Calculate position, ensuring window stays within bounds
        let restoreX =
          w.previousPosition?.x !== undefined
            ? w.previousPosition.x
            : (availableWidth - restoreWidth) / 2;
        let restoreY =
          w.previousPosition?.y !== undefined
            ? w.previousPosition.y
            : (availableHeight - restoreHeight) / 2;

        // Ensure window doesn't go off-screen - constrain position but keep original size
        restoreX = Math.max(0, Math.min(restoreX, availableWidth - restoreWidth));
        restoreY = Math.max(0, Math.min(restoreY, availableHeight - restoreHeight));

        return {
          ...w,
          isMaximized: false,
          isMinimized: false,
          isVisible: true,
          width: restoreWidth,
          height: restoreHeight,
          x: restoreX,
          y: restoreY,
        };
      })
    );
  }, []);

  return (
    <WindowContext.Provider
      value={{
        windows,
        addWindow,
        removeWindow,
        bringToFront,
        toggleWindowVisibility,
        setWindowState,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowContext = () => {
  const context = useContext(WindowContext);

  if (context === undefined) {
    throw new Error('useWindowContext must be used within a WindowProvider');
  }

  return context;
};








