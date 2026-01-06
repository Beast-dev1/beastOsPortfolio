import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  url: string;
  title: string;
  timestamp: number;
  favicon?: string;
}

const HISTORY_STORAGE_KEY = 'chrome-browser-history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Hook for managing browser history
 */
export function useBrowserHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setHistory(parsed);
        }
      } catch (error) {
        console.error('Failed to load browser history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && history.length > 0) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save browser history:', error);
      }
    }
  }, [history]);

  /**
   * Add a new item to history
   */
  const addToHistory = useCallback((url: string, title: string, favicon?: string) => {
    setHistory((prev) => {
      // Remove duplicate entries for the same URL
      const filtered = prev.filter((item) => item.url !== url);
      
      // Add new entry at the beginning
      const newItem: HistoryItem = {
        url,
        title: title || url,
        timestamp: Date.now(),
        favicon,
      };
      
      // Keep only the most recent MAX_HISTORY_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      return updated;
    });
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  /**
   * Remove a specific history item
   */
  const removeFromHistory = useCallback((url: string) => {
    setHistory((prev) => prev.filter((item) => item.url !== url));
  }, []);

  /**
   * Get history items from a specific time range
   */
  const getHistoryByDate = useCallback((days: number = 7) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return history.filter((item) => item.timestamp >= cutoff);
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    getHistoryByDate,
  };
}
