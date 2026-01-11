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
  // Search state for this tab
  searchQuery?: string;
  searchResults?: SearchResult[];
  isSearching?: boolean;
  searchError?: string | null;
  currentPage?: number;
  totalResults?: number;
  searchTime?: number;
  hasSearched?: boolean;
}

const GOOGLE_API_KEY = 'AIzaSyAw6utXcUhdzoqQQscBmW2ABe6feRmbplw';
const GOOGLE_CX_ID = '27e69eaf2dd014810';

interface SearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  pagemap?: {
    cse_image?: Array<{ src: string }>;
  };
}

interface SearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  queries?: {
    request?: Array<{ startIndex: number }>;
  };
  error?: {
    message: string;
    code: number;
  };
}

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
  
  // Search query state for new tab input (search results are stored per-tab)
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  // Track previous active tab to detect tab switches
  const prevActiveTabIdRef = useRef<string>(activeTabId);

  // Update URL input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.isNewTab ? '' : activeTab.url);
      // Reset search query input when switching to a new tab
      const tabSwitched = prevActiveTabIdRef.current !== activeTabId;
      if (tabSwitched && activeTab.isNewTab) {
        setSearchQuery('');
      }
      prevActiveTabIdRef.current = activeTabId;
    }
  }, [activeTab, activeTabId]);

  // Perform Google Custom Search - creates a new tab for search results
  const performSearch = useCallback(async (query: string, page: number = 1, tabId?: string) => {
    if (!query.trim()) return;

    const targetTabId = tabId || `tab-${Date.now()}`;
    const isNewTab = !tabId;

    // If creating a new tab, create it first
    if (isNewTab) {
      const newTab: Tab = {
        id: targetTabId,
        url: '',
        title: `Search: ${query}`,
        history: [],
        historyIndex: -1,
        isLoading: false,
        isNewTab: false,
        searchQuery: query,
        searchResults: [],
        isSearching: true,
        searchError: null,
        currentPage: page,
        totalResults: 0,
        searchTime: 0,
        hasSearched: false,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(targetTabId);
    } else {
      // Update existing tab's search state
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === targetTabId
            ? {
                ...tab,
                isSearching: true,
                searchError: null,
              }
            : tab
        )
      );
    }

    const startIndex = (page - 1) * 10 + 1;

    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX_ID}&q=${encodeURIComponent(query)}&start=${startIndex}`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Search API error');
      }

      const results = data.items || [];
      const total = parseInt(data.searchInformation?.totalResults || '0', 10);
      const time = data.searchInformation?.searchTime || 0;

      // Update tab with search results
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === targetTabId
            ? {
                ...tab,
                searchQuery: query,
                searchResults: results,
                totalResults: total,
                searchTime: time,
                hasSearched: true,
                currentPage: page,
                isSearching: false,
                searchError: null,
                title: `Search: ${query}`,
              }
            : tab
        )
      );
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred while searching. Please try again.';

      // Update tab with error
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === targetTabId
            ? {
                ...tab,
                isSearching: false,
                searchError: errorMessage,
                searchResults: [],
              }
            : tab
        )
      );
    }
  }, []);

  // Handle search submit - creates new tab for results
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const query = searchQuery.trim();
      if (query) {
        performSearch(query, 1);
        // Reset search query in the new tab view
        setSearchQuery('');
      }
    },
    [searchQuery, performSearch]
  );

  // Handle search input change
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle pagination
  const handleNextPage = useCallback(() => {
    const tab = tabs.find((t) => t.id === activeTabId);
    if (tab?.searchQuery?.trim() && tab.currentPage && tab.totalResults && tab.currentPage * 10 < tab.totalResults) {
      performSearch(tab.searchQuery.trim(), tab.currentPage + 1, activeTabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tabs, activeTabId, performSearch]);

  const handlePrevPage = useCallback(() => {
    const tab = tabs.find((t) => t.id === activeTabId);
    if (tab?.searchQuery?.trim() && tab.currentPage && tab.currentPage > 1) {
      performSearch(tab.searchQuery.trim(), tab.currentPage - 1, activeTabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tabs, activeTabId, performSearch]);

  // Handle search result click - open in new tab
  const handleResultClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, url: string, title: string) => {
      e.preventDefault();
      const newTabId = `tab-${Date.now()}`;
      const newTab: Tab = {
        id: newTabId,
        url: url,
        title: title,
        history: [url],
        historyIndex: 0,
        isLoading: true,
        isNewTab: false,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTabId);
    },
    []
  );

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
      // Use searchQuery when on new tab, urlInput otherwise
      const inputValue = (activeTab.isNewTab ? searchQuery : urlInput).trim();
      if (!inputValue) return;

      // Check if input looks like a URL (has protocol, or contains dots/slashes that suggest a domain)
      const looksLikeUrl = 
        /^https?:\/\//i.test(inputValue) || // Has protocol
        (inputValue.includes('.') && !inputValue.includes(' ')) || // Contains dot and no spaces (likely domain)
        /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(inputValue); // Looks like domain.tld format

      // If it doesn't look like a URL, treat it as a search query - create new tab
      if (!looksLikeUrl) {
        performSearch(inputValue, 1);
        // Reset search query in the new tab view
        if (activeTab.isNewTab) {
          setSearchQuery('');
        }
        return;
      }

      // If it looks like a URL, validate and normalize it
      const normalized = validateAndNormalizeUrl(inputValue);
      if (normalized) {
        navigateToUrl(normalized);
      } else {
        // If validation fails, treat as search query - create new tab
        performSearch(inputValue, 1);
        if (activeTab.isNewTab) {
          setSearchQuery('');
        }
      }
    },
    [urlInput, navigateToUrl, activeTab.isNewTab, performSearch, searchQuery]
  );

  // Navigate back - close current tab and go to previous tab
  const navigateBack = useCallback(() => {
    if (tabs.length <= 1) {
      // If it's the last tab, create a new one instead of closing
      createNewTab();
      return;
    }
    
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    if (currentIndex <= 0) return; // Already at first tab
    
    const previousTab = tabs[currentIndex - 1];
    
    // Close current tab and switch to previous tab
    setTabs((prev) => {
      const filtered = prev.filter((tab) => tab.id !== activeTabId);
      // Ensure we always have at least one tab
      if (filtered.length === 0) {
        const newTab = {
          id: `tab-${Date.now()}`,
          url: '',
          title: 'New Tab',
          history: [],
          historyIndex: -1,
          isLoading: false,
          isNewTab: true,
        };
        setActiveTabId(newTab.id);
        return [newTab];
      }
      return filtered;
    });
    setActiveTabId(previousTab.id);
  }, [activeTabId, tabs, createNewTab]);

  // Navigate forward - close current tab and go to next tab
  const navigateForward = useCallback(() => {
    if (tabs.length <= 1) {
      // If it's the last tab, create a new one instead of closing
      createNewTab();
      return;
    }
    
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    if (currentIndex >= tabs.length - 1) return; // Already at last tab
    
    const nextTab = tabs[currentIndex + 1];
    
    // Close current tab and switch to next tab
    setTabs((prev) => {
      const filtered = prev.filter((tab) => tab.id !== activeTabId);
      // Ensure we always have at least one tab
      if (filtered.length === 0) {
        const newTab = {
          id: `tab-${Date.now()}`,
          url: '',
          title: 'New Tab',
          history: [],
          historyIndex: -1,
          isLoading: false,
          isNewTab: true,
        };
        setActiveTabId(newTab.id);
        return [newTab];
      }
      return filtered;
    });
    setActiveTabId(nextTab.id);
  }, [activeTabId, tabs, createNewTab]);

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
    <div className="w-full h-full flex flex-col bg-white" style={{ height: '100%', minHeight: 0, maxHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Title Bar - Green */}
      <div className="h-8 bg-[#1e7e34] flex items-center justify-between px-1 md:px-2 overflow-x-auto scrollbar-hide flex-shrink-0">
        <div className="flex items-center gap-0.5 md:gap-1 min-w-0">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`group flex items-center gap-1 md:gap-2 px-2 md:px-3 h-6 rounded-t cursor-pointer flex-shrink-0 ${
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
              <span className={`text-[10px] md:text-xs truncate max-w-[60px] md:max-w-[120px] ${
                tab.id === activeTabId ? 'text-gray-800' : 'text-white'
              }`}>
                {tab.title}
              </span>
              <button
                className="opacity-0 md:group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-opacity flex-shrink-0"
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
            className="px-1.5 md:px-2 h-6 rounded-t bg-[#2d8f47] hover:bg-[#26803d] transition-colors flex-shrink-0"
            onClick={createNewTab}
            title="New Tab"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2 py-1 bg-white border-b border-gray-200 flex-shrink-0">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-0 md:gap-0.5 flex-shrink-0">
          <button
            className="p-1 md:p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            onClick={navigateBack}
            disabled={tabs.length <= 1 || tabs.findIndex((tab) => tab.id === activeTabId) <= 0}
            title="Back (Close tab and go to previous)"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
          </button>
          <button
            className="p-1 md:p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            onClick={navigateForward}
            disabled={tabs.length <= 1 || tabs.findIndex((tab) => tab.id === activeTabId) >= tabs.length - 1}
            title="Forward (Close tab and go to next)"
          >
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
          </button>
          <button
            className="p-1 md:p-1.5 hover:bg-gray-100 rounded transition-colors"
            onClick={refreshPage}
            title="Refresh"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700 ${activeTab.isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-1 md:gap-2 mx-1 md:mx-2 min-w-0">
          <div className="flex-1 relative flex items-center bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow min-w-0">
            <Search className="absolute left-2 md:left-3 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={activeTab.isNewTab ? searchQuery : urlInput}
              onChange={(e) => {
                if (activeTab.isNewTab) {
                  setSearchQuery(e.target.value);
                  setUrlInput(e.target.value);
                } else {
                  setUrlInput(e.target.value);
                }
              }}
              className="w-full px-8 md:px-10 py-1 md:py-1.5 text-xs md:text-sm text-gray-800 focus:outline-none"
              placeholder={activeTab.isNewTab ? "Search Google or type a URL" : activeTab.url}
            />
            <div className="hidden md:flex items-center gap-1 pr-2">
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
            {tab.hasSearched ? (
              // Search Results View - Only Results, No Logo or Search Bar
              <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
                <div className="w-full max-w-[652px] mx-auto pt-4 md:pt-6 px-4 md:px-6 pb-8">
                  {/* Results Info */}
                  {tab.totalResults && tab.totalResults > 0 && (
                    <div className="mb-3 text-xs md:text-sm text-[#5f6368]" style={{ fontFamily: 'Arial, sans-serif' }}>
                      About {tab.totalResults.toLocaleString()} results ({tab.searchTime?.toFixed(2) || '0'} seconds)
                    </div>
                  )}

                  {/* Error Message */}
                  {tab.searchError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {tab.searchError}
                    </div>
                  )}

                  {/* Loading State */}
                  {tab.isSearching && (!tab.searchResults || tab.searchResults.length === 0) && (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="text-sm text-gray-500" style={{ fontFamily: 'Arial, sans-serif' }}>Searching...</span>
                      </div>
                    </div>
                  )}

                  {/* Search Results */}
                  {!tab.isSearching && tab.searchResults && tab.searchResults.length > 0 && (
                    <div className="space-y-6 md:space-y-8">
                      {tab.searchResults.map((result, index) => {
                        const thumbnail = result.pagemap?.cse_image?.[0]?.src;
                        return (
                          <div key={index} className="flex gap-3 md:gap-4">
                            {thumbnail && (
                              <div className="flex-shrink-0">
                                <img
                                  src={thumbnail}
                                  alt=""
                                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded border border-gray-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="mb-1">
                                <a
                                  href={result.link}
                                  onClick={(e) => handleResultClick(e, result.link, result.title)}
                                  className="text-lg md:text-xl text-[#1a0dab] hover:underline cursor-pointer visited:text-[#681da8]"
                                  style={{ fontFamily: 'Arial, sans-serif' }}
                                >
                                  {result.title}
                                </a>
                              </div>
                              <div className="mb-1 text-xs md:text-sm text-[#006621]" style={{ fontFamily: 'Arial, sans-serif' }}>
                                {result.displayLink}
                              </div>
                              <div className="text-sm text-[#4d5156] leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
                                {result.snippet}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* No Results */}
                  {!tab.isSearching && !tab.searchError && (!tab.searchResults || tab.searchResults.length === 0) && tab.hasSearched && (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-base" style={{ fontFamily: 'Arial, sans-serif' }}>
                        No results found for "{tab.searchQuery}"
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {!tab.isSearching && tab.searchResults && tab.searchResults.length > 0 && tab.currentPage && tab.totalResults && (
                    <div className="mt-8 md:mt-10 flex items-center justify-center gap-4">
                      <button
                        onClick={handlePrevPage}
                        disabled={tab.currentPage === 1}
                        className="px-4 py-2 bg-[#f8f9fa] text-sm text-[#3c4043] rounded border border-[#dadce0] hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        Previous
                      </button>
                      <div className="text-sm text-[#5f6368]" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Page {tab.currentPage}
                      </div>
                      <button
                        onClick={handleNextPage}
                        disabled={tab.currentPage * 10 >= tab.totalResults}
                        className="px-4 py-2 bg-[#f8f9fa] text-sm text-[#3c4043] rounded border border-[#dadce0] hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : tab.isNewTab || !tab.url ? (
              // New Tab View - Search Homepage
              <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
                <div className="flex flex-col items-center justify-start pt-16 md:pt-[120px] px-4 flex-1">
                  {/* Google Logo */}
                  <div className="mb-4 md:mb-8">
                    <div className="text-[48px] md:text-[90px] font-normal tracking-tight leading-none" style={{ fontFamily: 'Arial, sans-serif' }}>
                      <span className="text-[#4285F4]">G</span>
                      <span className="text-[#EA4335]">o</span>
                      <span className="text-[#FBBC05]">o</span>
                      <span className="text-[#4285F4]">g</span>
                      <span className="text-[#34A853]">l</span>
                      <span className="text-[#EA4335]">e</span>
                    </div>
                  </div>
                  
                  {/* Custom Search Bar */}
                  <form onSubmit={handleSearchSubmit} className="w-full max-w-[584px] mb-4 md:mb-6">
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 md:left-5 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="w-full h-11 md:h-[44px] pl-10 md:pl-12 pr-10 md:pr-12 text-sm md:text-base text-gray-800 rounded-full border border-[#dfe1e5] focus:outline-none focus:shadow-md focus:border-transparent hover:shadow-md transition-shadow"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                        placeholder="Search Google or type a URL"
                      />
                    </div>
                  </form>
                  
                  {/* Search Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full max-w-[584px] mb-4 md:mb-8">
                    <button
                      onClick={handleSearchSubmit}
                      disabled={!searchQuery.trim()}
                      className="px-4 py-2 bg-[#f8f9fa] text-xs md:text-sm text-gray-700 rounded border border-transparent hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      Google Search
                    </button>
                    <button className="px-4 py-2 bg-[#f8f9fa] text-xs md:text-sm text-gray-700 rounded border border-transparent hover:border-gray-300 hover:shadow-sm transition-all" style={{ fontFamily: 'Arial, sans-serif' }}>
                      I'm Feeling Lucky
                    </button>
                  </div>
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

