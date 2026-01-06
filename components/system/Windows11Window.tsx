'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import Image from 'next/image';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

import { useWindowContext } from '@/Context/windowContext';

export default function Windows11Window({
  id,
  title,
  icon,
  initialWidth,
  initialHeight,
  children,
}: {
  id: string;
  title: string;
  icon: string;
  initialWidth: number;
  initialHeight: number;
  children: React.ReactNode;
}) {
  const {
    windows,
    setWindowState,
    removeWindow,
    bringToFront,
    minimizeWindow,
  } = useWindowContext();
  const win = windows.find((w) => w.id === id);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpening) {
      const timer = setTimeout(() => setIsOpening(false), 300);

      return () => clearTimeout(timer);
    }
  }, [isOpening]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!win || !win.isVisible) return null;

  const handleMinimize = () => {
    if (isMobile) {
      minimizeWindow(id);

      return;
    }

    setIsMinimizing(true);
    const windowElement = windowRef.current;

    if (windowElement) {
      const rect = windowElement.getBoundingClientRect();
      const startX = rect.left;
      const startY = rect.top;
      const startWidth = rect.width;

      const endX = window.innerWidth / 2;
      const endY = window.innerHeight;

      windowElement.style.transition =
        'transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)';
      windowElement.style.transform = `
        translate(${endX - startX - startWidth / 2}px, ${endY - startY}px)
        scale(0.1)
      `;
      windowElement.style.opacity = '0';
    }

    setTimeout(() => {
      minimizeWindow(id);
      setIsMinimizing(false);
      if (windowElement) {
        windowElement.style.transition = '';
        windowElement.style.transform = '';
        windowElement.style.opacity = '';
      }
    }, 250);
  };

  const handleMaximize = () => {
    if (isMobile) return; // Do nothing on mobile

    if (win.isMaximized) {
      setWindowState(id, {
        isMaximized: false,
        width: win.previousSize?.width || initialWidth,
        height: win.previousSize?.height || initialHeight,
        x: win.previousPosition?.x || 0,
        y: win.previousPosition?.y || 0,
      });
    } else {
      setWindowState(id, {
        isMaximized: true,
        previousSize: {
          width: win.width as number,
          height: win.height as number,
        },
        previousPosition: { x: win.x || 40, y: win.y || 90 },
        width: '100%',
        height: '95.5%',
        x: 0,
        y: 0,
      });
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      removeWindow(id);
    }, 200);
  };

  const safeZIndex =
    typeof win.zIndex === 'number' && isFinite(win.zIndex) ? win.zIndex : 9999;

  return (
    <Rnd
      bounds={isMobile ? 'window' : 'parent'}
      dragHandleClassName="window-header"
      minHeight={isMobile ? '100%' : initialHeight}
      minWidth={isMobile ? '100%' : initialWidth}
      position={isMobile ? { x: 0, y: 0 } : { x: win.x, y: win.y }}
      size={
        isMobile
          ? { width: '100%', height: '100%' }
          : { width: win.width, height: win.height }
      }
      style={{
        zIndex: safeZIndex,
      }}
      disableDragging={isMobile}
      enableResizing={!isMobile}
      onDragStart={() => setIsDragging(true)}
      onDragStop={(_e: any, d: any) => {
        setIsDragging(false);
        setWindowState(id, { x: d.x, y: d.y });
      }}
      onMouseDown={() => bringToFront(id)}
      onResizeStop={(_e: any, _direction: any, ref: any, _delta: any, position: any) => {
        setWindowState(id, {
          width: ref.style.width,
          height: ref.style.height,
          ...position,
        });
      }}
    >
      <div
        ref={windowRef}
        className={`window-frame bg-[#f3f3f3] dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#3a3a3a] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.48)] overflow-hidden h-full flex flex-col ${
          isMobile ? 'fixed inset-0' : ''
        }`}
        style={{
          transition: isDragging
            ? 'none'
            : 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
          transform: isOpening || isClosing ? 'scale(0.96)' : 'scale(1)',
          opacity: isOpening || isClosing ? 0 : 1,
        }}
      >
        {/* Windows 11 Title Bar */}
        <div className="window-header flex items-center justify-between px-0 bg-gradient-to-b from-[#fafafa] to-[#f0f0f0] dark:from-[#2d2d2d] dark:to-[#252525] border-b border-[#e5e5e5] dark:border-[#3a3a3a] h-11 select-none">
          {/* Left side: Icon and Title */}
          <div className="flex items-center px-4 flex-1 min-w-0">
            <Image
              alt={title}
              className="w-4 h-4 mr-3 flex-shrink-0"
              src={icon}
              width={16}
              height={16}
            />
            <h3 className="text-sm font-normal text-[#1a1a1a] dark:text-[#ffffff] truncate">
              {title}
            </h3>
          </div>

          {/* Right side: Window Controls */}
          <div className="flex items-center h-full">
            {/* Minimize Button */}
            <button
              className="w-11 h-11 flex items-center justify-center hover:bg-[#e5e5e5] dark:hover:bg-[#3a3a3a] transition-colors duration-150 focus:outline-none group"
              onClick={handleMinimize}
              aria-label="Minimize"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Minus
                className="w-4 h-4 text-[#1a1a1a] dark:text-[#ffffff] group-hover:scale-110 transition-transform"
                strokeWidth={2.5}
              />
            </button>

            {/* Maximize/Restore Button */}
            <button
              className="w-11 h-11 flex items-center justify-center hover:bg-[#e5e5e5] dark:hover:bg-[#3a3a3a] transition-colors duration-150 focus:outline-none group"
              onClick={handleMaximize}
              aria-label={win.isMaximized ? 'Restore' : 'Maximize'}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {win.isMaximized ? (
                <Maximize2
                  className="w-3.5 h-3.5 text-[#1a1a1a] dark:text-[#ffffff] group-hover:scale-110 transition-transform"
                  strokeWidth={2.5}
                />
              ) : (
                <Square
                  className="w-3.5 h-3.5 text-[#1a1a1a] dark:text-[#ffffff] group-hover:scale-110 transition-transform"
                  strokeWidth={2}
                  fill="none"
                />
              )}
            </button>

            {/* Close Button */}
            <button
              className="w-11 h-11 flex items-center justify-center hover:bg-[#e81123] hover:text-white transition-colors duration-150 focus:outline-none group"
              onClick={handleClose}
              aria-label="Close"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X
                className="w-4 h-4 text-[#1a1a1a] dark:text-[#ffffff] group-hover:text-white group-hover:scale-110 transition-all"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="window-content flex-grow overflow-auto bg-[#ffffff] dark:bg-[#1a1a1a] m-0 p-0">
          {children}
        </div>
      </div>
    </Rnd>
  );
}
