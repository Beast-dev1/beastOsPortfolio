'use client';

import { FileIcon, Folder } from 'lucide-react';
import Image from 'next/image';

interface DesktopIconProps {
  icon?: string;
  type?: 'app' | 'file' | 'folder';
  fileName?: string;
  size?: number;
}

export const renderDesktopIcon = ({ icon, type, fileName, size = 64 }: DesktopIconProps) => {
  // If icon is provided (for apps), use it
  if (icon) {
    return (
      <Image
        src={icon}
        alt={fileName || 'Icon'}
        width={size}
        height={size}
        className="w-full h-full object-contain"
        unoptimized
      />
    );
  }

  // For folders
  if (type === 'folder') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Folder size={size} className="text-blue-400" />
      </div>
    );
  }

  // For files, determine icon based on extension
  if (type === 'file' && fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return (
          <div className="w-full h-full flex items-center justify-center bg-red-500/20 rounded">
            <FileIcon size={size * 0.7} className="text-red-400" />
          </div>
        );
      case 'doc':
      case 'docx':
        return (
          <div className="w-full h-full flex items-center justify-center bg-blue-500/20 rounded">
            <FileIcon size={size * 0.7} className="text-blue-400" />
          </div>
        );
      case 'ppt':
      case 'pptx':
        return (
          <div className="w-full h-full flex items-center justify-center bg-orange-500/20 rounded">
            <FileIcon size={size * 0.7} className="text-orange-400" />
          </div>
        );
      case 'xls':
      case 'xlsx':
        return (
          <div className="w-full h-full flex items-center justify-center bg-green-500/20 rounded">
            <FileIcon size={size * 0.7} className="text-green-400" />
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return (
          <div className="w-full h-full flex items-center justify-center bg-purple-500/20 rounded">
            <FileIcon size={size * 0.7} className="text-purple-400" />
          </div>
        );
      case 'mp3':
      case 'wav':
      case 'flac':
        return (
          <div className="w-full h-full flex items-center justify-center bg-pink-500/20 rounded">
            <FileIcon size={size * 0.7} className="text-pink-400" />
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <FileIcon size={size * 0.7} className="text-gray-400" />
          </div>
        );
    }
  }

  // Default fallback
  return (
    <div className="w-full h-full flex items-center justify-center">
      <FileIcon size={size * 0.7} className="text-gray-400" />
    </div>
  );
};


