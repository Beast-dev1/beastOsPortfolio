'use client';
import { useEffect, useState } from 'react';

import Windows11Window from '@/components/system/Windows11Window';
import DesktopIcons from '@/components/system/DesktopIcons';
import { useWindowContext } from '@/Context/windowContext';

export default function Desktop() {
  const { windows, addWindow, removeWindow } = useWindowContext();
  const [firstTime, setFirstTime] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isFirstTime = localStorage.getItem('firstTime') === null;
    setFirstTime(isFirstTime);

  }, [addWindow]);

  if (!isClient) {
    return null; // or a loading indicator
  }

  return (
    <>
      <DesktopIcons />
      {windows.map((window) => (
        <Windows11Window
          key={window.id}
          icon={window.icon}
          id={window.id}
          initialHeight={(window.height as number) || 500}
          initialWidth={(window.width as number) || 500}
          title={window.title || window.id}
        >
          {window.content}
        </Windows11Window>
      ))}
    </>
  );
}

