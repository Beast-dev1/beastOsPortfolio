'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { renderDesktopIcon } from '@/utils/renderDesktopIcon';
import { DesktopIcon } from '@/hooks/useDesktopIcons';

interface DesktopIconItemProps {
  icon: DesktopIcon;
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDoubleClick: (icon: DesktopIcon) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

export default React.memo(function DesktopIconItem({
  icon,
  position,
  isSelected,
  onSelect,
  onDoubleClick,
  onPositionChange,
}: DesktopIconItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragStartPos({ x: position.x, y: position.y });
  }, [position]);

  const handleDragEnd = useCallback(
    (_event: any, info: any) => {
      setIsDragging(false);
      if (dragStartPos) {
        const newX = dragStartPos.x + info.offset.x;
        const newY = dragStartPos.y + info.offset.y;
        onPositionChange(icon.id, newX, newY);
      }
      setDragStartPos(null);
    },
    [icon.id, onPositionChange, dragStartPos]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Only select if not dragging
      if (!isDragging) {
        onSelect(icon.id);
      }
    },
    [icon.id, onSelect, isDragging]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDoubleClick(icon);
    },
    [icon, onDoubleClick]
  );

  return (
    <motion.div
      className="absolute select-none desktop-icon-item"
      style={{
        left: position.x,
        top: position.y,
      }}
      drag
      dragMomentum={false}
      dragConstraints={{
        left: 20,
        top: 20,
        right: typeof window !== 'undefined' ? window.innerWidth - 100 : 1000,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 140 : 800,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95, zIndex: 1000 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`
          flex flex-col items-center justify-center
          w-20 cursor-pointer
          p-2 rounded-lg
          transition-all duration-150
          ${isSelected ? 'bg-blue-500/30 backdrop-blur-sm' : ''}
          ${!isDragging && !isSelected ? 'hover:bg-white/10 hover:backdrop-blur-sm' : ''}
        `}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Icon Container */}
        <div
          className={`
            w-16 h-16 rounded-lg
            flex items-center justify-center
            mb-1
            ${isSelected ? 'ring-2 ring-blue-400' : ''}
            transition-all duration-150
          `}
        >
          {icon.icon ? (
            <Image
              src={icon.icon}
              alt={icon.name}
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
              unoptimized
            />
          ) : (
            renderDesktopIcon({
              icon: icon.icon,
              type: icon.type,
              fileName: icon.fileData?.name,
              size: 64,
            })
          )}
        </div>

        {/* Label */}
        <div
          className={`
            text-xs text-white text-center
            px-1 py-0.5 rounded
            max-w-[80px] break-words
            leading-tight
            ${isSelected ? 'bg-blue-500/50' : ''}
            transition-all duration-150
            drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]
          `}
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
          }}
        >
          {icon.name}
        </div>
      </div>
    </motion.div>
  );
});

