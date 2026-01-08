'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface WallpaperContextType {
  currentWallpaper: string;
  setWallpaper: (url: string) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

const DEFAULT_WALLPAPER = '/windows11-wallpaper.jpg';
const STORAGE_KEY = 'desktop-wallpaper';

export const WallpaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize with default, update from localStorage on client
  const [currentWallpaper, setCurrentWallpaperState] = useState<string>(DEFAULT_WALLPAPER);

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentWallpaperState(stored);
      }
    }
  }, []);

  const setWallpaper = useCallback((url: string) => {
    setCurrentWallpaperState(url);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, url);
    }
  }, []);

  // Always provide the context, even during SSR
  return (
    <WallpaperContext.Provider value={{ currentWallpaper, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (context === undefined) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
};

