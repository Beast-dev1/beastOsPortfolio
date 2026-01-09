'use client';

import React from 'react';
import Image from 'next/image';

interface ImageViewerProps {
  imageUrl: string;
  imageName?: string;
}

export default function ImageViewer({ imageUrl, imageName }: ImageViewerProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-auto p-2 md:p-4">
      <div className="relative max-w-full max-h-full">
        <Image
          src={imageUrl}
          alt={imageName || 'Image'}
          width={1920}
          height={1080}
          className="max-w-full max-h-[calc(100vh-1rem)] md:max-h-[calc(100vh-2rem)] object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}


