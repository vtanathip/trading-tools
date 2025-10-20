/**
 * Cache manager for LocalStorage with TTL and capacity management
 * Implements 24-hour TTL and LRU eviction strategy
 */

const CACHE_PREFIX = 'crypto-dca-cache:';
const DEFAULT_TTL_MS = 86400000; // 24 hours in milliseconds
const MAX_CACHE_SIZE_BYTES = 5242880; // 5MB (typical LocalStorage limit is 5-10MB)
const EVICTION_THRESHOLD = 0.8; // 80% capacity trigger

/**
 * Generate cache key with prefix
 * @param {string} key - Cache key
 * @returns {string} Prefixed cache key
 */
function getCacheKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Get the current size of cache in bytes (approximate)
 * @returns {number} Approximate cache size in bytes
 */
function getCacheSize() {
  let totalSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      const value = localStorage.getItem(key);
      // Each character is approximately 2 bytes in UTF-16
      totalSize += (key.length + (value ? value.length : 0)) * 2;
    }
  }
  
  return totalSize;
}

/**
 * Get all cache entries with their timestamps
 * @returns {Array<{key: string, timestamp: number}>} Array of cache entries
 */
function getCacheEntries() {
  const entries = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        entries.push({
          key: key,
          timestamp: data.timestamp || 0,
        });
      } catch (error) {
        // Invalid entry, skip it
        continue;
      }
    }
  }
  
  return entries;
}

/**
 * Evict least recently used (LRU) cache entries
 * @param {number} targetSize - Target cache size after eviction
 */
function evictLRU(targetSize = MAX_CACHE_SIZE_BYTES * EVICTION_THRESHOLD) {
  const entries = getCacheEntries();
  
  // Sort by timestamp (oldest first)
  entries.sort((a, b) => a.timestamp - b.timestamp);
  
  let currentSize = getCacheSize();
  
  // Remove oldest entries until we reach target size
  for (const entry of entries) {
    if (currentSize <= targetSize) {
      break;
    }
    
    localStorage.removeItem(entry.key);
    currentSize = getCacheSize();
  }
}

/**
 * Set item in cache with TTL
 * @param {string} key - Cache key
 * @param {*} value - Value to cache (will be JSON serialized)
 * @param {number} ttlMs - Time to live in milliseconds (default: 24 hours)
 * @returns {boolean} Success status
 */
export function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  try {
    const cacheKey = getCacheKey(key);
    const data = {
      value: value,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    
    // Check if we need to evict before adding
    const currentSize = getCacheSize();
    if (currentSize >= MAX_CACHE_SIZE_BYTES * EVICTION_THRESHOLD) {
      evictLRU();
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return true;
  } catch (error) {
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      evictLRU(MAX_CACHE_SIZE_BYTES / 2); // More aggressive eviction
      
      try {
        const cacheKey = getCacheKey(key);
        const data = {
          value: value,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttlMs,
        };
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return true;
      } catch (retryError) {
        console.error('Failed to set cache after eviction:', retryError);
        return false;
      }
    }
    
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * Get item from cache if valid
 * @param {string} key - Cache key
 * @returns {*|null} Cached value or null if not found/expired
 */
export function get(key) {
  try {
    const cacheKey = getCacheKey(key);
    const item = localStorage.getItem(cacheKey);
    
    if (!item) {
      return null;
    }
    
    const data = JSON.parse(item);
    
    // Check if expired
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data.value;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Check if cache entry is valid (exists and not expired)
 * @param {string} key - Cache key
 * @returns {boolean} True if cache entry is valid
 */
export function isValid(key) {
  try {
    const cacheKey = getCacheKey(key);
    const item = localStorage.getItem(cacheKey);
    
    if (!item) {
      return false;
    }
    
    const data = JSON.parse(item);
    return Date.now() <= data.expiresAt;
  } catch (error) {
    return false;
  }
}

/**
 * Clear expired cache entries
 * @returns {number} Number of entries cleared
 */
export function clearExpired() {
  const entries = getCacheEntries();
  const now = Date.now();
  let clearedCount = 0;
  
  for (const entry of entries) {
    try {
      const data = JSON.parse(localStorage.getItem(entry.key) || '{}');
      if (now > data.expiresAt) {
        localStorage.removeItem(entry.key);
        clearedCount++;
      }
    } catch (error) {
      // Invalid entry, remove it
      localStorage.removeItem(entry.key);
      clearedCount++;
    }
  }
  
  return clearedCount;
}

/**
 * Clear all cache entries
 * @returns {number} Number of entries cleared
 */
export function clearAll() {
  const entries = getCacheEntries();
  
  for (const entry of entries) {
    localStorage.removeItem(entry.key);
  }
  
  return entries.length;
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getStats() {
  const entries = getCacheEntries();
  const totalSize = getCacheSize();
  const now = Date.now();
  
  const expiredCount = entries.filter((entry) => {
    try {
      const data = JSON.parse(localStorage.getItem(entry.key) || '{}');
      return now > data.expiresAt;
    } catch (error) {
      return true;
    }
  }).length;
  
  return {
    totalEntries: entries.length,
    validEntries: entries.length - expiredCount,
    expiredEntries: expiredCount,
    totalSizeBytes: totalSize,
    maxSizeBytes: MAX_CACHE_SIZE_BYTES,
    utilizationPercent: (totalSize / MAX_CACHE_SIZE_BYTES) * 100,
  };
}
