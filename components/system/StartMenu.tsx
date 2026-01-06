'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, 
  ChevronRight, 
  User, 
  Image as ImageIcon, 
  Settings, 
  Power,
  MoreHorizontal,
  Send,
  Phone,
  MessageSquare,
  Wifi,
  Bluetooth,
  BellOff
} from 'lucide-react';
import { useWindowContext } from '@/Context/windowContext';
import { appConfig } from '@/config/apps';
import Terminal from './Terminal';
import FileExplorer from './FileExplorer';
import Chrome from './Chrome';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartMenu({ isOpen, onClose }: StartMenuProps) {
  const { addWindow, windows } = useWindowContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const powerMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (powerMenuRef.current && powerMenuRef.current.contains(event.target as Node)) {
          return;
        }
        onClose();
        setShowPowerMenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Filter apps based on search
  const filteredPinnedApps = appConfig.pinnedApps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecommended = appConfig.recommendedItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (appId: string, appName: string, appIcon: string) => {
    // Check if app is already open
    const existingWindow = windows.find(w => w.id === appId);
    
    if (!existingWindow) {
      // Handle specific apps
      if (appId === 'Terminal') {
        addWindow(appId, <Terminal />, 800, 500, appIcon);
      } else if (appId === 'FileExplorer') {
        addWindow(appId, <FileExplorer />, 1000, 700, appIcon);
      } else if (appId === 'GoogleChrome') {
        addWindow(appId, <Chrome />, 1200, 800, appIcon);
      } else {
        // Default placeholder for other apps
        addWindow(
          appId,
          <div className="p-4 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{appName}</h2>
              <p className="text-sm text-gray-500">App component coming soon</p>
            </div>
          </div>,
          800,
          600,
          appIcon
        );
      }
    }
    
    onClose();
    setSearchQuery('');
  };

  const handlePowerAction = (action: string) => {
    switch (action) {
      case 'restart':
        // Reload the page
        window.location.reload();
        break;
      case 'shutdown':
        // Navigate away or show shutdown animation
        window.location.href = '/';
        break;
      case 'sleep':
        // Close all windows or minimize
        onClose();
        break;
      default:
        break;
    }
    setShowPowerMenu(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
            onClick={onClose}
          />

          {/* Start Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-16 left-64 -translate-x-1/2 z-[10000] w-[1000px] h-[600px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="flex h-full">
              {/* Main Content */}
              <div className="w-[700px] flex flex-col overflow-hidden border-r border-[rgba(255,255,255,0.1)]">
                {/* Search Bar */}
                <div className="px-2 pt-2 pb-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for apps, settings, and documents"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-10 pr-4 rounded-3xl bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] focus:bg-[rgba(255,255,255,0.12)] border border-transparent focus:border-[rgba(255,255,255,0.15)] text-white placeholder-gray-400 text-sm outline-none transition-all duration-200"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-hidden px-4 pb-4">
                  {/* Pinned Apps Section */}
                  {!searchQuery && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-xs  text-gray-400  tracking-wide">
                          Pinned
                        </h3>
                        <button className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-0.5 px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.1)]">
                          All <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {appConfig.pinnedApps.map((app) => (
                          <motion.button
                            key={app.id}
                            onClick={() => handleAppClick(app.id, app.name, app.icon)}
                            className="flex flex-col items-center gap-2.5 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.1)] transition-colors group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-14 h-14 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden shadow-sm">
                              <Image
                                src={app.icon}
                                alt={app.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain"
                                unoptimized
                              />
                            </div>
                            <span className="text-xs text-gray-300 group-hover:text-white transition-colors text-center leading-tight max-w-full truncate">
                              {app.name}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results or Recommended Section */}
                  {searchQuery ? (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Results
                      </h3>
                      <div className="space-y-1">
                        {filteredPinnedApps.map((app) => (
                          <motion.button
                            key={app.id}
                            onClick={() => handleAppClick(app.id, app.name, app.icon)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden flex-shrink-0">
                              <Image
                                src={app.icon}
                                alt={app.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm text-white font-medium">{app.name}</div>
                            </div>
                          </motion.button>
                        ))}
                        {filteredRecommended.map((item) => (
                          <motion.button
                            key={item.id}
                            onClick={() => handleAppClick(item.id, item.name, item.icon)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden flex-shrink-0">
                              <Image
                                src={item.icon}
                                alt={item.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm text-white font-medium">{item.name}</div>
                              <div className="text-xs text-gray-400">{item.description}</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Recommended
                        </h3>
                        <button className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-0.5 px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.1)]">
                          More <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {appConfig.recommendedItems.map((item) => (
                          <motion.button
                            key={item.id}
                            onClick={() => handleAppClick(item.id, item.name, item.icon)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden flex-shrink-0">
                              <Image
                                src={item.icon}
                                alt={item.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="text-sm text-white font-medium truncate">{item.name}</div>
                              <div className="text-xs text-gray-400 truncate">{item.description}</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Section - User Profile & Power Options */}
                <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-white font-medium">Prakash Rai</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="w-8 h-8 rounded-lg hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-colors"
                      aria-label="Photos"
                    >
                      <ImageIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleAppClick('Settings', 'Settings', '/cursor/about-svgrepo-com.svg')}
                      className="w-8 h-8 rounded-lg hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-colors"
                      aria-label="Settings"
                    >
                      <Settings className="w-4 h-4 text-white" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowPowerMenu(!showPowerMenu)}
                        className="w-8 h-8 rounded-lg hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-colors"
                        aria-label="Power Options"
                      >
                        <Power className="w-4 h-4 text-white" />
                      </button>
                      {showPowerMenu && (
                        <motion.div
                          ref={powerMenuRef}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full right-0 mb-2 w-48 rounded-lg overflow-hidden"
                          style={{
                            background: 'rgba(30, 30, 30, 0.98)',
                            backdropFilter: 'blur(40px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          <button
                            onClick={() => handlePowerAction('sleep')}
                            className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                          >
                            Sleep
                          </button>
                          <button
                            onClick={() => handlePowerAction('restart')}
                            className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                          >
                            Restart
                          </button>
                          <button
                            onClick={() => handlePowerAction('shutdown')}
                            className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                          >
                            Shut down
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Phone Sidebar */}
              <div className="flex-1 flex flex-col bg-[rgba(20,20,20,0.3)]">
                {/* Device Info */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-24 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.05)]">
                      <Phone className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-white mb-1.5">Samsung Galaxy S23 Ultra</div>
                      <div className="flex items-center justify-center gap-2">
                        <BellOff className="w-3.5 h-3.5 text-gray-400" />
                        <Bluetooth className="w-3.5 h-3.5 text-gray-400" />
                        <Wifi className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 pb-3">
                  <div className="space-y-0.5">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                      <MessageSquare className="w-5 h-5 text-white" />
                      <span className="text-sm text-white">Messages</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                      <Phone className="w-5 h-5 text-white" />
                      <span className="text-sm text-white">Calls</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                      <ImageIcon className="w-5 h-5 text-white" />
                      <span className="text-sm text-white">Photos</span>
                    </button>
                  </div>
                </div>

                {/* Recent Section */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Recent
                  </h3>
                  <div className="space-y-0.5">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="#25D366"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm text-white font-medium">WhatsApp</div>
                        <div className="text-xs text-gray-400">2 new notifications</div>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm text-white font-medium">Google</div>
                        <div className="text-xs text-gray-400">2 new notifications</div>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077B5"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm text-white font-medium">LinkedIn</div>
                        <div className="text-xs text-gray-400">2 new notifications</div>
                      </div>
                    </button>
                  </div>
                </div>

             
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

