/**
 * Cache Entry Types
 * 
 * LocalStorage cache structure for price data.
 * Based on data-model.md specifications.
 */

import type { PriceDataPoint } from './price.types';

/**
 * Cache Entry Metadata
 * 
 * Metadata about cached price data.
 */
export interface CacheMetadata {
  /** Asset pair (e.g., "BTC-USD") */
  assetPair: string;
  
  /** Start date of cached data (ISO 8601) */
  startDate: string;
  
  /** End date of cached data (ISO 8601) */
  endDate: string;
  
  /** Number of data points in cache */
  dataPoints: number;
}

/**
 * Cache Entry
 * 
 * LocalStorage cache structure for price data.
 */
export interface CacheEntry {
  /** Cache key format: "{assetPair}-{startDate}-{endDate}" */
  key: string;
  
  /** Array of price data points */
  data: PriceDataPoint[];
  
  /** When data was fetched (Unix timestamp ms) */
  fetchedAt: number;
  
  /** When cache expires (fetchedAt + 24h) (Unix timestamp ms) */
  expiresAt: number;
  
  /** API source (e.g., "CoinGecko") */
  source: string;
  
  /** Cache metadata */
  metadata: CacheMetadata;
}

/**
 * Cache Configuration
 * 
 * Expiration rules and storage limits.
 */
export interface CacheConfig {
  /** Time-to-live: 24 hours in milliseconds */
  ttl: 86400000; // 24 * 60 * 60 * 1000
  
  /** Target storage usage threshold (80% capacity) */
  storageThreshold: 0.8;
  
  /** Total capacity: 5-10MB (browser dependent) */
  totalCapacityMin: 5242880; // 5MB in bytes
  totalCapacityMax: 10485760; // 10MB in bytes
  
  /** Target usage: < 80% capacity (4-8MB) */
  targetUsageMin: 4194304; // 4MB in bytes
  targetUsageMax: 8388608; // 8MB in bytes
  
  /** Per asset cache: ~100KB for 5 years of daily data */
  perAssetCacheSize: 102400; // 100KB in bytes
  
  /** Maximum cached assets: ~40-80 different asset-date-range combinations */
  maxCachedAssetsMin: 40;
  maxCachedAssetsMax: 80;
}

/**
 * LocalStorage Schema Structure
 * 
 * Root structure for DCA simulator LocalStorage.
 */
export interface LocalStorageSchema {
  dca_simulator: {
    /** Schema version */
    version: string;
    
    /** Price cache storage */
    priceCache: Record<string, CacheEntry>;
    
    /** Last fetch timestamps by asset pair */
    lastFetch: Record<string, number>;
    
    /** User settings */
    settings: {
      defaultCurrency: string;
      defaultFrequency: string;
    };
  };
}

/**
 * Cache validation function type
 */
export type CacheValidationFn = (entry: CacheEntry) => boolean;

/**
 * Cache eviction strategy type
 */
export type CacheEvictionFn = () => void;
