'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Home,
  Star,
  StarOff,
  Plus,
  X,
  Search,
  Clock,
  Bookmark,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validateAndNormalizeUrl,
  getFaviconUrl,
  getProxyUrl,
  getDomain,
  isLikelyBlocked,
  sanitizeUrl,
} from '@/utils/browserUtils';
import { useBrowserHistory } from '@/hooks/useBrowserHistory';
import { useBookmarks } from '@/hooks/useBookmarks';

interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  error?: string;
  useProxy: boolean;
}

const DEFAULT_HOMEPAGE = 'https://www.google.com';

export default function Chrome() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      url: DEFAULT_HOMEPAGE,
      title: 'New Tab',
      history: [DEFAULT_HOMEPAGE],
      historyIndex: 0,
      isLoading: false,
      useProxy: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState<string>('');
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const iframeRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());
  const urlInputRef = useRef<HTMLInputElement>(null);

  const { history, addToHistory } = useBrowserHistory();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  // Update URL input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab]);

  // Focus URL input on mount
  useEffect(() => {
    urlInputRef.current?.focus();
  }, []);

  // Create new tab
  const createNewTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      url: DEFAULT_HOMEPAGE,
      title: 'New Tab',
      history: [DEFAULT_HOMEPAGE],
      historyIndex: 0,
      isLoading: false,
      useProxy: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
  }, []);

  // Close tab
  const closeTab = useCallback(
    (tabId: string) => {
      if (tabs.length === 1) {
        // If it's the last tab, create a new one
        createNewTab();
      }
      setTabs((prev) => {
        const filtered = prev.filter((tab) => tab.id !== tabId);
        if (activeTabId === tabId && filtered.length > 0) {
          setActiveTabId(filtered[filtered.length - 1].id);
        }
        return filtered;
      });
    },
    [tabs.length, activeTabId, createNewTab]
  );

  // Navigate to URL
  const navigateToUrl = useCallback(
    (url: string, tabId?: string) => {
      const targetTabId = tabId || activeTabId;
      const sanitized = sanitizeUrl(url);
      const normalized = validateAndNormalizeUrl(sanitized);

      if (!normalized) {
        // Try Google search
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        navigateToUrl(searchUrl, targetTabId);
        return;
      }

      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === targetTabId) {
            const newHistory = tab.history.slice(0, tab.historyIndex + 1);
            newHistory.push(normalized);
            // Check if site is likely blocked, but we'll try direct load first
            // If it fails, we'll show error with option to open in new tab
            return {
              ...tab,
              url: normalized,
              history: newHistory,
              historyIndex: newHistory.length - 1,
              isLoading: true,
              error: undefined,
              useProxy: false, // Try direct first
            };
          }
          return tab;
        })
      );

      // Add to browser history
      addToHistory(normalized, normalized, getFaviconUrl(normalized));
    },
    [activeTabId, addToHistory]
  );

  // Handle URL input submit
  const handleUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      navigateToUrl(urlInput);
    },
    [urlInput, navigateToUrl]
  );

  // Navigate back
  const navigateBack = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId && tab.historyIndex > 0) {
          const newIndex = tab.historyIndex - 1;
          return {
            ...tab,
            url: tab.history[newIndex],
            historyIndex: newIndex,
            isLoading: true,
            error: undefined,
          };
        }
        return tab;
      })
    );
  }, [activeTabId]);

  // Navigate forward
  const navigateForward = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId && tab.historyIndex < tab.history.length - 1) {
          const newIndex = tab.historyIndex + 1;
          return {
            ...tab,
            url: tab.history[newIndex],
            historyIndex: newIndex,
            isLoading: true,
            error: undefined,
          };
        }
        return tab;
      })
    );
  }, [activeTabId]);

  // Refresh page
  const refreshPage = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            isLoading: true,
            error: undefined,
          };
        }
        return tab;
      })
    );
    // Trigger iframe reload
    const iframe = iframeRefs.current.get(activeTabId);
    if (iframe) {
      iframe.src = iframe.src;
    }
  }, [activeTabId]);

  // Go to homepage
  const goHome = useCallback(() => {
    navigateToUrl(DEFAULT_HOMEPAGE);
  }, [navigateToUrl]);

  // Toggle bookmark
  const toggleBookmark = useCallback(() => {
    if (isBookmarked(activeTab.url)) {
      const bookmark = bookmarks.find((b) => b.url === activeTab.url);
      if (bookmark) {
        removeBookmark(bookmark.id);
      }
    } else {
      addBookmark(activeTab.url, activeTab.title, activeTab.favicon);
    }
  }, [activeTab, isBookmarked, bookmarks, addBookmark, removeBookmark]);

  // Handle iframe load
  const handleIframeLoad = useCallback(
    (tabId: string) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === tabId) {
            const iframe = iframeRefs.current.get(tabId);
            let title = tab.url;
            try {
              // Try to get title from iframe (may not work due to CORS)
              if (iframe?.contentDocument?.title) {
                title = iframe.contentDocument.title;
              }
            } catch {
              // CORS error, use domain as title
              title = getDomain(tab.url);
            }
            return {
              ...tab,
              isLoading: false,
              title,
              favicon: getFaviconUrl(tab.url),
            };
          }
          return tab;
        })
      );
    },
    []
  );

  // Handle iframe error
  const handleIframeError = useCallback(
    (tabId: string) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === tabId) {
            // Show error message with option to open in new tab
            // Most proxy services return JSON which can't be embedded in iframes
            return {
              ...tab,
              isLoading: false,
              error: 'This site cannot be embedded due to security restrictions. Click "Open in New Tab" to view it.',
            };
          }
          return tab;
        })
      );
    },
    []
  );

  // Get iframe source URL
  const getIframeSrc = useCallback((tab: Tab) => {
    // Note: Proxy services that return JSON can't be used directly in iframes
    // For blocked sites, we'll show an error message with option to open in new tab
    return tab.url;
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#f5f5f5] dark:bg-[#1e1e1e] overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center bg-[#e8e8e8] dark:bg-[#2d2d2d] border-b border-[#d0d0d0] dark:border-[#404040] overflow-x-auto">
        <div className="flex items-center flex-1 min-w-0">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`group flex items-center gap-2 px-4 py-2 min-w-[200px] max-w-[240px] cursor-pointer border-r border-[#d0d0d0] dark:border-[#404040] ${
                tab.id === activeTabId
                  ? 'bg-white dark:bg-[#1e1e1e]'
                  : 'bg-[#e8e8e8] dark:bg-[#2d2d2d] hover:bg-[#d0d0d0] dark:hover:bg-[#353535]'
              }`}
              onClick={() => setActiveTabId(tab.id)}
              whileHover={{ backgroundColor: tab.id === activeTabId ? undefined : 'rgba(0,0,0,0.05)' }}
            >
              {tab.favicon ? (
                <img
                  src={tab.favicon}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm text-[#1a1a1a] dark:text-[#ffffff] truncate flex-1">
                {tab.title}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#c0c0c0] dark:hover:bg-[#404040] transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className="w-3 h-3 text-[#1a1a1a] dark:text-[#ffffff]" />
              </button>
            </motion.div>
          ))}
        </div>
        <button
          className="px-3 py-2 hover:bg-[#d0d0d0] dark:hover:bg-[#353535] transition-colors"
          onClick={createNewTab}
          title="New Tab"
        >
          <Plus className="w-4 h-4 text-[#1a1a1a] dark:text-[#ffffff]" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1e1e1e] border-b border-[#e0e0e0] dark:border-[#404040]">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded hover:bg-[#e8e8e8] dark:hover:bg-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={navigateBack}
            disabled={activeTab.historyIndex === 0}
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#1a1a1a] dark:text-[#ffffff]" />
          </button>
          <button
            className="p-2 rounded hover:bg-[#e8e8e8] dark:hover:bg-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={navigateForward}
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            title="Forward"
          >
            <ArrowRight className="w-4 h-4 text-[#1a1a1a] dark:text-[#ffffff]" />
          </button>
          <button
            className="p-2 rounded hover:bg-[#e8e8e8] dark:hover:bg-[#2d2d2d] transition-colors"
            onClick={refreshPage}
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#1a1a1a] dark:text-[#ffffff] ${activeTab.isLoading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            className="p-2 rounded hover:bg-[#e8e8e8] dark:hover:bg-[#2d2d2d] transition-colors"
            onClick={goHome}
            title="Home"
          >
            <Home className="w-4 h-4 text-[#1a1a1a] dark:text-[#ffffff]" />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={urlInputRef}
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-4 py-1.5 pl-10 pr-10 rounded-full bg-[#f5f5f5] dark:bg-[#2d2d2d] border border-[#d0d0d0] dark:border-[#404040] text-sm text-[#1a1a1a] dark:text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:border-transparent"
              placeholder="Search Google or type a URL"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            type="button"
            className={`p-2 rounded hover:bg-[#e8e8e8] dark:hover:bg-[#2d2d2d] transition-colors ${
              isBookmarked(activeTab.url) ? 'text-yellow-500' : 'text-[#1a1a1a] dark:text-[#ffffff]'
            }`}
            onClick={toggleBookmark}
            title={isBookmarked(activeTab.url) ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked(activeTab.url) ? (
              <Star className="w-4 h-4 fill-current" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            className="p-2 rounded hover:bg-[#e8e8e8] dark:hover:bg-[#2d2d2d] transition-colors relative"
            onClick={() => setShowHistoryMenu(!showHistoryMenu)}
            title="History"
          >
            <Clock className="w-4 h-4 text-[#1a1a1a] dark:text-[#ffffff]" />
            {showHistoryMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 max-h-96 overflow-y-auto bg-white dark:bg-[#2d2d2d] border border-[#d0d0d0] dark:border-[#404040] rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">
                    History
                  </div>
                  {history.slice(0, 20).map((item) => (
                    <button
                      key={item.timestamp}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#e8e8e8] dark:hover:bg-[#353535] text-left"
                      onClick={() => {
                        navigateToUrl(item.url);
                        setShowHistoryMenu(false);
                      }}
                    >
                      {item.favicon && (
                        <img
                          src={item.favicon}
                          alt=""
                          className="w-4 h-4 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[#1a1a1a] dark:text-[#ffffff] truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.url}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Bookmarks Bar */}
      {showBookmarksBar && bookmarks.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#f8f8f8] dark:bg-[#252525] border-b border-[#e0e0e0] dark:border-[#404040] overflow-x-auto">
          {bookmarks.slice(0, 10).map((bookmark) => (
            <button
              key={bookmark.id}
              className="flex items-center gap-1.5 px-3 py-1 rounded hover:bg-[#e8e8e8] dark:hover:bg-[#353535] transition-colors whitespace-nowrap"
              onClick={() => navigateToUrl(bookmark.url)}
              title={bookmark.title}
            >
              {bookmark.favicon && (
                <img
                  src={bookmark.favicon}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span className="text-xs text-[#1a1a1a] dark:text-[#ffffff]">
                {bookmark.title.length > 20 ? `${bookmark.title.substring(0, 20)}...` : bookmark.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Browser Content Area */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#1e1e1e]">
        <AnimatePresence mode="wait">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`absolute inset-0 ${tab.id === activeTabId ? 'z-10' : 'z-0'}`}
              style={{ display: tab.id === activeTabId ? 'block' : 'none' }}
            >
              {tab.error ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-[#ffffff] mb-2">
                    Unable to load page
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{tab.error}</p>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 bg-[#0078D4] text-white rounded hover:bg-[#0066b3] transition-colors"
                      onClick={() => navigateToUrl(tab.url)}
                    >
                      Try Again
                    </button>
                    <a
                      href={tab.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-[#d0d0d0] dark:border-[#404040] rounded hover:bg-[#e8e8e8] dark:hover:bg-[#353535] transition-colors flex items-center gap-2 text-[#1a1a1a] dark:text-[#ffffff]"
                    >
                      Open in New Tab <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full">
                  <iframe
                    ref={(el) => {
                      if (el) iframeRefs.current.set(tab.id, el);
                    }}
                    src={tab.url}
                    className="w-full h-full border-0"
                    onLoad={() => handleIframeLoad(tab.id)}
                    onError={() => handleIframeError(tab.id)}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                    title={tab.title}
                  />
                  {tab.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1e1e1e] bg-opacity-75">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-[#0078D4] animate-spin" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

