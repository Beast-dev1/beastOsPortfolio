'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Wifi, 
  Volume2, 
  ChevronUp,
  Search,
  CloudSun,
  Loader2
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { useWindowContext } from '@/Context/windowContext';
import { useBattery } from '@/hooks/useBattery';
import { appConfig } from '@/config/apps';
import StartMenu from './StartMenu';
import Terminal from './Terminal';
import FileExplorer from './FileExplorer';
import Chrome from './Chrome';
import Music from './Music';
import AboutMe from './AboutMe';
import Mail from './Mail';
import Photos from './Photos';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
const DEFAULT_CITY = 'London'; // Fallback city if geolocation fails

export default function Taskbar() {
  const { windows, addWindow, restoreWindow, setWindowState, bringToFront } = useWindowContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [showSystemTray, setShowSystemTray] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const { level: batteryLevel, charging: batteryCharging, supported: batterySupported } = useBattery();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch weather data
  const fetchWeather = async (city: string) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      
      setWeather({
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeatherError('Unable to load weather');
      // Set fallback data
      setWeather({
        temperature: 20,
        condition: 'Partly sunny',
        icon: '02d',
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  // Get user location and fetch weather
  useEffect(() => {
    const getWeatherData = async () => {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              setWeatherLoading(true);
              setWeatherError(null);
              
              const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
              );

              if (!response.ok) {
                throw new Error('Failed to fetch weather data');
              }

              const data = await response.json();
              
              setWeather({
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].main,
                icon: data.weather[0].icon,
              });
            } catch (error) {
              console.error('Error fetching weather:', error);
              // Fallback to default city
              await fetchWeather(DEFAULT_CITY);
            } finally {
              setWeatherLoading(false);
            }
          },
          async () => {
            // Geolocation failed, use default city
            await fetchWeather(DEFAULT_CITY);
          }
        );
      } else {
        // Geolocation not supported, use default city
        await fetchWeather(DEFAULT_CITY);
      }
    };

    getWeatherData();

    // Refresh weather every 10 minutes
    const weatherInterval = setInterval(() => {
      getWeatherData();
    }, 10 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Close Start Menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.start-menu') && !target.closest('.start-button')) {
        setIsStartMenuOpen(false);
      }
    };

    if (isStartMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isStartMenuOpen]);

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAppClick = (appId: string) => {
    const window = windows.find((w) => w.id === appId);

    if (window) {
      if (window.isMinimized) {
        restoreWindow(appId);
      } else {
        setWindowState(appId, { isVisible: true });
        bringToFront(appId);
      }
    } else {
      // Get app icon
      const app = appConfig.taskbarApps.find((app) => app.id === appId);
      const appIcon = app?.icon || '';
      
      // Handle specific apps
      if (appId === 'Terminal') {
        addWindow(appId, <Terminal />, 800, 500, appIcon);
        return;
      }
      
      if (appId === 'FileExplorer') {
        addWindow(appId, <FileExplorer />, 1000, 700, appIcon, 'This PC');
        return;
      }
      
      if (appId === 'GoogleChrome') {
        addWindow(appId, <Chrome />, 1200, 800, appIcon);
        return;
      }
      
      if (appId === 'Music') {
        addWindow(appId, <Music />, 900, 600, appIcon);
        return;
      }
      
      if (appId === 'aboutMe') {
        addWindow(appId, <AboutMe />, 1000, 700, appIcon);
        return;
      }
      
      if (appId === 'Mail') {
        addWindow(appId, <Mail />, 1200, 800, appIcon);
        return;
      }
      
      if (appId === 'Photos') {
        addWindow(appId, <Photos />, 1000, 700, appIcon);
        return;
      }
      
      // Default placeholder for other apps
      addWindow(
        appId,
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{app?.name || appId}</h2>
            <p className="text-sm text-gray-500">App component coming soon</p>
          </div>
        </div>,
        800,
        600,
        appIcon
      );
    }
  };

  const isAppRunning = (appId: string) => {
    return windows.some((w) => w.id === appId && !w.isMinimized && w.isVisible);
  };

  const isAppActive = (appId: string) => {
    if (windows.length === 0) return false;
    const topWindow = windows.reduce((prev, current) => 
      (current.zIndex > prev.zIndex ? current : prev)
    );
    return topWindow.id === appId && topWindow.isVisible && !topWindow.isMinimized;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999]">
      {/* Windows 11 Taskbar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-12 md:h-12 w-full px-1 flex items-center justify-between gap-1 md:gap-2 bg-[#2b2b2b] dark:bg-[#2b2b2b]"
      >
        {/* Left Side - Weather Widget (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 px-2 py-1.5 ml-1 rounded-md hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200 cursor-pointer">
          {weatherLoading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : weather ? (
            <>
              {weather.icon ? (
                <Image
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.condition}
                  width={64}
                  height={64}
                  className="w-8 h-8"
                />
              ) : (
                <CloudSun className="w-5 h-5 text-white" />
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white leading-tight">
                  {weather.temperature}°C
                </span>
                <span className="text-[12px] text-gray-300 leading-tight capitalize">
                  {weather.condition}
                </span>
              </div>
            </>
          ) : (
            <>
              <CloudSun className="w-5 h-5 text-white" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white leading-tight">--°C</span>
                <span className="text-[12px] text-gray-300 leading-tight">
                  {weatherError || 'Loading...'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Center Section - Start Button, Search Bar, and App Icons */}
        <div className="flex items-center gap-0.5 md:gap-1 flex-1 justify-center min-w-0">
          {/* Start Button */}
          <button
            className="start-button w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200 active:scale-95 flex-shrink-0"
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            aria-label="Start Menu"
          >
            {/* Windows 11 Logo */}
            <Image
              src="/icons/windows/windows.png"
              alt="Windows Logo"
              width={28}
              height={28}
              className="w-4 h-4 md:w-6 md:h-6 object-contain"
              unoptimized
            />
          </button>

          {/* Search Bar (Hidden on small mobile, visible on larger screens) */}
          <div className="hidden sm:flex relative items-center">
            <Search className="w-4 h-4 text-white absolute left-2 md:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              className="w-32 md:w-56 h-7 md:h-8 pl-7 md:pl-9 pr-2 md:pr-3 rounded-2xl bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] focus:bg-[rgba(255,255,255,0.15)] border border-transparent focus:border-[rgba(255,255,255,0.2)] text-white placeholder-gray-400 text-xs md:text-sm outline-none transition-all duration-200"
            />
          </div>

          {/* Taskbar App Icons */}
          <div className="flex items-center gap-0 md:gap-0.5 overflow-x-auto scrollbar-hide">
            {appConfig.taskbarApps.map((app) => {
              const isRunning = isAppRunning(app.id);
              const isActive = isAppActive(app.id);

              return (
                <motion.button
                  key={app.id}
                  className={`relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? 'bg-[rgba(255,255,255,0.15)]'
                      : 'hover:bg-[rgba(255,255,255,0.1)]'
                  }`}
                  onClick={() => handleAppClick(app.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={app.name}
                >
                  <Image
                    src={app.icon}
                    alt={app.name}
                    width={24}
                    height={24}
                    className="w-5 h-5 md:w-6 md:h-6 object-contain"
                    unoptimized
                  />
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-1 left-3 -translate-x-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-[#0078D4] rounded-full"
                      layoutId="activeIndicator"
                      initial={false}
                    />
                  )}
                  {/* Running indicator dot */}
                  {isRunning && !isActive && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0078D4] rounded-full" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right Side - System Tray */}
        <div className="flex items-center h-full gap-0 pr-0 md:pr-0 flex-shrink-0">
          {/* System Icons (Hidden on mobile, visible on tablet+) */}
          <div className="hidden md:flex items-center gap-0 -space-x-1">
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200"
              aria-label="WiFi"
            >
              <Wifi className="w-4 h-5 text-white" />
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200"
              aria-label="Volume"
            >
              <Volume2 className="w-4 h-5 text-white" />
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center gap-0.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200"
              aria-label={batterySupported && batteryLevel != null ? `Battery ${batteryLevel}%${batteryCharging ? ' (Charging)' : ''}` : 'Battery'}
              title={batterySupported && batteryLevel != null ? `${batteryLevel}%${batteryCharging ? ' (Charging)' : ''}` : 'Battery'}
            >
              <Icon
                icon={batteryCharging ? 'mdi:battery-charging' : 'gg:battery'}
                className="w-4 h-6 text-white flex-shrink-0"
              />
              {batterySupported && batteryLevel != null && (
                <span className="text-[10px] text-white font-medium">{batteryLevel}%</span>
              )}
            </button>
          </div>

          {/* Date/Time */}
          <button
            className="px-2 md:px-3 h-8 flex flex-col items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200"
            onClick={() => setShowSystemTray(!showSystemTray)}
          >
            <span className="text-[10px] md:text-xs font-medium text-white leading-tight">
              {formatTime()}
            </span>
            <span className="hidden md:block text-xs text-gray-300 leading-tight">
              {formatDate()}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Start Menu */}
      <StartMenu isOpen={isStartMenuOpen} onClose={() => setIsStartMenuOpen(false)} />
    </div>
  );
}

