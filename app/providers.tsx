'use client';

import * as React from 'react';
import { WindowProvider } from '@/Context/windowContext';
import { FileSystemProvider } from '@/Context/FileSystemContext';
import { WallpaperProvider } from '@/Context/WallpaperContext';

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WallpaperProvider>
      <WindowProvider>
        <FileSystemProvider>{children}</FileSystemProvider>
      </WindowProvider>
    </WallpaperProvider>
  );
}



