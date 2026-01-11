'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { FolderOpen, Copy, Image as ImageIcon } from 'lucide-react';
import { useWindowContext } from '@/Context/windowContext';
import { useWallpaper } from '@/Context/WallpaperContext';
import ContextMenu from './ContextMenu';
import ImageViewer from './ImageViewer';

// List of wallpaper images - can be expanded
const WALLPAPERS = [
  '/wallpapers/wallpaper1.svg',
  '/wallpapers/wallpaper2.svg',
  '/wallpapers/wallpaper3.svg',
  '/wallpapers/wallpaper4.svg',
  '/wallpapers/wallpaper5.svg',
];

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  imageUrl: string;
}

export default function Photos() {
  const { addWindow } = useWindowContext();
  const { setWallpaper } = useWallpaper();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, imageUrl: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        imageUrl,
      });
    },
    []
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleOpen = useCallback(
    (imageUrl: string) => {
      const imageName = imageUrl.split('/').pop() || 'Image';
      addWindow(
        `ImageViewer-${Date.now()}`,
        <ImageViewer imageUrl={imageUrl} imageName={imageName} />,
        1000,
        700,
        '/icons/pictures/pictures.png'
      );
    },
    [addWindow]
  );

  const handleCopy = useCallback(async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy image:', error);
      // Fallback: try copying as data URL
      try {
        const canvas = document.createElement('canvas');
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({
                  [blob.type]: blob,
                }),
              ]);
            }
          });
        }
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
    }
  }, []);

  const handleSetWallpaper = useCallback(
    (imageUrl: string) => {
      setWallpaper(imageUrl);
    },
    [setWallpaper]
  );

  const contextMenuOptions = contextMenu
    ? [
        {
          label: 'Open',
          icon: <FolderOpen className="w-4 h-4" />,
          action: () => handleOpen(contextMenu.imageUrl),
        },
        {
          label: 'Copy',
          icon: <Copy className="w-4 h-4" />,
          action: () => handleCopy(contextMenu.imageUrl),
        },
        {
          label: 'Set as Wallpaper',
          icon: <ImageIcon className="w-4 h-4" />,
          action: () => handleSetWallpaper(contextMenu.imageUrl),
        },
      ]
    : [];

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a] text-white overflow-hidden">
     

      {/* Grid Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6"
        onClick={handleCloseContextMenu}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {WALLPAPERS.map((wallpaper, index) => (
            <div
              key={index}
              className="group relative aspect-video rounded-md md:rounded-lg overflow-hidden cursor-pointer bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all"
              onContextMenu={(e) => handleContextMenu(e, wallpaper)}
              onClick={() => handleOpen(wallpaper)}
            >
              <Image
                src={wallpaper}
                alt={`Wallpaper ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  // Fallback if image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                onLoad={(e) => {
                  // Ensure image is visible on load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'block';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu?.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenuOptions}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
}

