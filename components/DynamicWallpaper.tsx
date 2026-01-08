'use client';

import { useEffect } from 'react';
import { useWallpaper } from '@/Context/WallpaperContext';

export default function DynamicWallpaper() {
  const { currentWallpaper } = useWallpaper();

  useEffect(() => {
    // Apply wallpaper to body element
    if (typeof window !== 'undefined') {
      const body = document.body;
      body.style.backgroundImage = `url(${currentWallpaper})`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
      body.style.backgroundColor = '#1e3a8a'; // Fallback color
    }
  }, [currentWallpaper]);

  return null;
}

