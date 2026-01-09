'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
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
  allIconPositions: Map<string, { x: number; y: number }>;
}

export default React.memo(function DesktopIconItem({
  icon,
  position,
  isSelected,
  onSelect,
  onDoubleClick,
  onPositionChange,
  allIconPositions,
}: DesktopIconItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const shouldPreventClickRef = useRef(false);
  
  // Memoize drag constraints to avoid recalculation during drag
  // Grid cell size is 100px, icon width is 80px
  const dragConstraints = useRef({
    left: 10,
    top: 10,
    right: typeof window !== 'undefined' ? window.innerWidth - 90 : 1000,
    bottom: typeof window !== 'undefined' ? window.innerHeight - 140 : 800,
  });
  
  // Update constraints on window resize
  useEffect(() => {
    const updateConstraints = () => {
      const isMobile = window.innerWidth < 768;
      dragConstraints.current = {
        left: isMobile ? 10 : 20,
        top: isMobile ? 10 : 20,
        right: window.innerWidth - (isMobile ? 90 : 100),
        bottom: window.innerHeight - 140,
      };
    };
    
    window.addEventListener('resize', updateConstraints);
    updateConstraints();
    
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  // Update motion values when position prop changes (but not during drag)
  // Animate to new position smoothly
  useEffect(() => {
    if (!isDragging) {
      // Animate to new position for smooth grid snapping
      animate(x, position.x, { duration: 0.2, type: 'spring', stiffness: 300, damping: 30 });
      animate(y, position.y, { duration: 0.2, type: 'spring', stiffness: 300, damping: 30 });
    }
  }, [position.x, position.y, isDragging, x, y]);

  const handleDragStart = useCallback((_event: any, info: any) => {
    // Prevent default to stop any interference
    _event.preventDefault();
    setIsDragging(true);
    setHasDragged(false);
    shouldPreventClickRef.current = false;
    // Store the starting position
    dragStartPosRef.current = { x: position.x, y: position.y };
  }, [position]);

  const handleDrag = useCallback(
    (_event: any, info: any) => {
      // Check if we've moved more than 5px (actual drag, not just click)
      const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
      if (dragDistance > 5) {
        if (!hasDragged) {
          setHasDragged(true);
        }
        shouldPreventClickRef.current = true;
      }
    },
    [hasDragged]
  );

  const handleDragEnd = useCallback(
    (_event: any, info: any) => {
      setIsDragging(false);
      
      // Calculate new position based on current motion values
      const newX = x.get();
      const newY = y.get();
      
      // Let parent handle grid snapping and collision detection
      // This will return the final position
      onPositionChange(icon.id, newX, newY);
      
      // Reset flags after a short delay to allow click handler to check them
      setTimeout(() => {
        setHasDragged(false);
        shouldPreventClickRef.current = false;
      }, 150);
    },
    [icon.id, onPositionChange]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent click if we just dragged or are currently dragging
      if (shouldPreventClickRef.current || hasDragged || isDragging) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      e.stopPropagation();
      onSelect(icon.id);
    },
    [icon.id, onSelect, isDragging, hasDragged]
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
      ref={containerRef}
      className="absolute select-none desktop-icon-item pointer-events-auto"
      style={{ 
        x,
        y,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints.current}
      dragTransition={{ power: 0, timeConstant: 0 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95, zIndex: 9999 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`
          flex flex-col items-center justify-center
          w-16 md:w-20
          p-1.5 md:p-2 rounded-lg
          transition-all duration-150
          ${isSelected ? 'bg-blue-500/30 backdrop-blur-sm' : ''}
          ${!isDragging && !isSelected ? 'hover:bg-white/10 hover:backdrop-blur-sm active:bg-white/20' : ''}
        `}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Icon Container */}
        <div
          className={`
            w-12 h-12 md:w-16 md:h-16 rounded-lg
            flex items-center justify-center
            mb-0.5 md:mb-1
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
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
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
            text-[10px] md:text-xs text-white text-center
            px-0.5 md:px-1 py-0 md:py-0.5 rounded
            max-w-[64px] md:max-w-[80px] break-words
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

