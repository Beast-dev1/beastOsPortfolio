/**
 * Browser utility functions for URL validation, favicon fetching, and proxy URL generation
 */

/**
 * Validates and normalizes a URL
 * @param url - The URL string to validate
 * @returns The normalized URL or null if invalid
 */
export function validateAndNormalizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Trim whitespace
  url = url.trim();
  
  // If empty, return null
  if (url === '') return null;
  
  // If it already looks like a URL, try to use it
  if (url.match(/^https?:\/\//i)) {
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }
  
  // Try adding https://
  try {
    const testUrl = `https://${url}`;
    new URL(testUrl);
    return testUrl;
  } catch {
    // If that fails, try http://
    try {
      const testUrl = `http://${url}`;
      new URL(testUrl);
      return testUrl;
    } catch {
      return null;
    }
  }
}

/**
 * Gets the favicon URL for a given website
 * @param url - The website URL
 * @returns The favicon URL
 */
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
  } catch {
    return '/cursor/chrome.svg'; // Default favicon
  }
}

/**
 * Generates a proxy URL for sites that block iframe embedding
 * @param url - The original URL
 * @returns The proxy URL
 */
export function getProxyUrl(url: string): string {
  // Using allorigins.win as a CORS proxy
  // Note: This is a public proxy service and may have rate limits
  const encodedUrl = encodeURIComponent(url);
  return `https://api.allorigins.win/get?url=${encodedUrl}`;
}

/**
 * Extracts the domain from a URL
 * @param url - The URL
 * @returns The domain name
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Checks if a URL is likely to block iframe embedding
 * Common sites that block: Google, Facebook, Twitter, etc.
 * @param url - The URL to check
 * @returns True if likely to be blocked
 */
export function isLikelyBlocked(url: string): boolean {
  const blockedDomains = [
    'google.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'linkedin.com',
    'youtube.com',
    'github.com',
    'stackoverflow.com',
    'reddit.com',
  ];
  
  try {
    const domain = getDomain(url);
    return blockedDomains.some(blocked => domain.includes(blocked));
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL to prevent XSS attacks
 * @param url - The URL to sanitize
 * @returns The sanitized URL
 */
export function sanitizeUrl(url: string): string {
  // Remove javascript: and data: protocols
  const lowerUrl = url.toLowerCase().trim();
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
    return '';
  }
  return url.trim();
}
