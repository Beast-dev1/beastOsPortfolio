import { useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  timestamp: number;
}

const BOOKMARKS_STORAGE_KEY = 'chrome-browser-bookmarks';

/**
 * Hook for managing bookmarks
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setBookmarks(parsed);
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Failed to save bookmarks:', error);
      }
    }
  }, [bookmarks]);

  /**
   * Add a bookmark
   */
  const addBookmark = useCallback((url: string, title: string, favicon?: string) => {
    // Check if bookmark already exists
    const exists = bookmarks.some((bookmark) => bookmark.url === url);
    if (exists) {
      return false; // Already bookmarked
    }

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      title: title || url,
      favicon,
      timestamp: Date.now(),
    };

    setBookmarks((prev) => [...prev, newBookmark]);
    return true;
  }, [bookmarks]);

  /**
   * Remove a bookmark
   */
  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  }, []);

  /**
   * Check if a URL is bookmarked
   */
  const isBookmarked = useCallback((url: string) => {
    return bookmarks.some((bookmark) => bookmark.url === url);
  }, [bookmarks]);

  /**
   * Get bookmark by URL
   */
  const getBookmark = useCallback((url: string) => {
    return bookmarks.find((bookmark) => bookmark.url === url);
  }, [bookmarks]);

  /**
   * Update a bookmark
   */
  const updateBookmark = useCallback((id: string, updates: Partial<Bookmark>) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark
      )
    );
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmark,
    updateBookmark,
  };
}
