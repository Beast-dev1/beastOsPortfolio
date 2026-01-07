'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Plus,
  X,
  Search,
  Star,
  MoreVertical,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  validateAndNormalizeUrl,
  getFaviconUrl,
  getDomain,
  sanitizeUrl,
} from '@/utils/browserUtils';

interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  isNewTab: boolean;
}

const GOOGLE_CSE_ID = '860b9ebedfe00480b';

export default function Chrome() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      url: '',
      title: 'New Tab',
      history: [],
      historyIndex: -1,
      isLoading: false,
      isNewTab: true,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState<string>('');
  const iframeRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());
  const cseLoadedRef = useRef<boolean>(false);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  // Load Google CSE script and add custom styles
  useEffect(() => {
    if (!cseLoadedRef.current && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = `https://cse.google.com/cse.js?cx=${GOOGLE_CSE_ID}`;
      script.async = true;
      document.body.appendChild(script);
      cseLoadedRef.current = true;

      // Add custom styles for Google CSE to match Google's design
      const style = document.createElement('style');
      style.textContent = `
        .gsc-control-cse {
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
        }
        .gsc-search-box {
          margin: 0 !important;
        }
        .gsc-input-box {
          border: 1px solid #dfe1e5 !important;
          border-radius: 24px !important;
          box-shadow: 0 2px 5px 1px rgba(64,60,67,.16) !important;
          height: 44px !important;
          padding: 0 16px !important;
          background: white !important;
        }
        .gsc-input-box:hover {
          box-shadow: 0 2px 8px 1px rgba(64,60,67,.24) !important;
        }
        .gsc-input-box:focus-within {
          box-shadow: 0 2px 8px 1px rgba(64,60,67,.24) !important;
          border-color: transparent !important;
        }
        .gsc-input {
          font-size: 16px !important;
          padding: 0 !important;
          height: 100% !important;
        }
        .gsib_a {
          padding: 0 !important;
        }
        .gsc-search-button {
          display: none !important;
        }
        .gsc-results-wrapper-overlay {
          border: 1px solid #dfe1e5 !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px 1px rgba(64,60,67,.24) !important;
          margin-top: 8px !important;
        }
        .gsc-results {
          padding: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Update URL input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.isNewTab ? '' : activeTab.url);
    }
  }, [activeTab]);

  // Create new tab
  const createNewTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      url: '',
      title: 'New Tab',
      history: [],
      historyIndex: -1,
      isLoading: false,
      isNewTab: true,
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
      const normalized = validateAndNormalizeUrl(sanitized) || sanitized;

      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === targetTabId) {
            const newHistory = tab.history.slice(0, tab.historyIndex + 1);
            newHistory.push(normalized);
            return {
              ...tab,
              url: normalized,
              history: newHistory,
              historyIndex: newHistory.length - 1,
              isLoading: true,
              isNewTab: false,
            };
          }
          return tab;
        })
      );
    },
    [activeTabId]
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
          };
        }
        return tab;
      })
    );
    const iframe = iframeRefs.current.get(activeTabId);
    if (iframe) {
      iframe.src = iframe.src;
    }
  }, [activeTabId]);

  // Reset to new tab
  const resetToNewTab = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            url: '',
            history: [],
            historyIndex: -1,
            isNewTab: true,
            isLoading: false,
          };
        }
        return tab;
      })
    );
    setUrlInput('');
  }, [activeTabId]);

  // Handle iframe load
  const handleIframeLoad = useCallback(
    (tabId: string) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === tabId) {
            const iframe = iframeRefs.current.get(tabId);
            let title = tab.url;
            try {
              if (iframe?.contentDocument?.title) {
                title = iframe.contentDocument.title;
              }
            } catch {
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

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Title Bar - Green */}
      <div className="h-8 bg-[#1e7e34] flex items-center justify-between px-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`group flex items-center gap-2 px-3 h-6 rounded-t cursor-pointer ${
                tab.id === activeTabId
                  ? 'bg-white'
                  : 'bg-[#2d8f47] hover:bg-[#26803d]'
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.favicon && !tab.isNewTab ? (
                <img
                  src={tab.favicon}
                  alt=""
                  className="w-3 h-3 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className={`text-xs truncate max-w-[120px] ${
                tab.id === activeTabId ? 'text-gray-800' : 'text-white'
              }`}>
                {tab.title}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className={`w-3 h-3 ${tab.id === activeTabId ? 'text-gray-600' : 'text-white'}`} />
              </button>
            </motion.div>
          ))}
          <button
            className="px-2 h-6 rounded-t bg-[#2d8f47] hover:bg-[#26803d] transition-colors"
            onClick={createNewTab}
            title="New Tab"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-white border-b border-gray-200">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-0.5">
          <button
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            onClick={navigateBack}
            disabled={activeTab.historyIndex < 0}
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            onClick={navigateForward}
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            title="Forward"
          >
            <ArrowRight className="w-4 h-4 text-gray-700" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            onClick={refreshPage}
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-700 ${activeTab.isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-2 mx-2">
          <div className="flex-1 relative flex items-center bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-10 py-1.5 text-sm text-gray-800 focus:outline-none"
              placeholder={activeTab.isNewTab ? "Search Google or type a URL" : activeTab.url}
            />
            <div className="flex items-center gap-1 pr-2">
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Bookmark"
              >
                <Star className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="More"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Browser Content Area */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${tab.id === activeTabId ? 'z-10' : 'z-0'}`}
            style={{ display: tab.id === activeTabId ? 'block' : 'none' }}
          >
            {tab.isNewTab || !tab.url ? (
              <div className="w-full h-full flex flex-col items-center justify-start pt-[120px] bg-white overflow-y-auto">
                {/* Google Logo */}
                <div className="mb-8">
                  <div className="text-[90px] font-normal tracking-tight leading-none">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </div>
                </div>
                
                {/* Google CSE Search Bar */}
                <div className="w-full max-w-[584px] px-4 mb-6">
                  <div className="gcse-searchbox-only" data-gname="searchresults"></div>
                </div>
                
                {/* Search Buttons */}
                <div className="flex gap-3 mb-8">
                  <button className="px-4 py-2 bg-[#f8f9fa] text-sm text-gray-700 rounded border border-transparent hover:border-gray-300 hover:shadow-sm transition-all">
                    Google Search
                  </button>
                  <button className="px-4 py-2 bg-[#f8f9fa] text-sm text-gray-700 rounded border border-transparent hover:border-gray-300 hover:shadow-sm transition-all">
                    I'm Feeling Lucky
                  </button>
                </div>
                
                {/* Search Results Container */}
                <div className="w-full max-w-[652px] px-4 pb-8">
                  <div className="gcse-searchresults-only" data-gname="searchresults"></div>
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
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                  title={tab.title}
                />
                {tab.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

