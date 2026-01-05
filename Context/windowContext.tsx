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
    icon?: string
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
      icon: string = ''
    ) => {
      setWindows((prev) => {
        const windowExists = prev.some((window) => window.id === id);

        if (windowExists) {
          return prev; // Don't add a new window if it already exists
        }

        // Calculate the center position
        const centerX = (window.innerWidth - width) / 2;
        const centerY = (window.innerHeight - height) / 2;

        const others = prev.filter((w) => w.id !== id);
        const maxZIndex = Math.min(
          Math.max(...others.map((w) => w.zIndex), 0) + 1,
          MAX_Z_INDEX
        );

        return [
          ...prev,
          {
            id,
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
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              isMaximized: false,
              isMinimized: false,
              isVisible: true,
              width: w.previousSize?.width || 500,
              height: w.previousSize?.height || 500,
              x:
                w.previousPosition?.x !== undefined
                  ? w.previousPosition.x
                  : (window.innerWidth - (w.previousSize?.width || 500)) / 2,
              y:
                w.previousPosition?.y !== undefined
                  ? w.previousPosition.y
                  : (window.innerHeight - (w.previousSize?.height || 500)) / 2,
            }
          : w
      )
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



