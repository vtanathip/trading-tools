/**
 * API Response Types
 * 
 * External API interfaces and error handling.
 * Based on data-model.md specifications.
 */

import type { PriceDataPoint } from './price.types';

/**
 * API Error
 * 
 * Standardized error structure for API failures.
 */
export interface ApiError {
  /** Error message */
  message: string;
  
  /** HTTP status code (if applicable) */
  statusCode?: number;
  
  /** Error code (e.g., "RATE_LIMIT_EXCEEDED", "NETWORK_ERROR") */
  code: string;
  
  /** Original error object */
  originalError?: Error;
  
  /** Timestamp when error occurred */
  timestamp: number;
}

/**
 * API Response wrapper
 * 
 * Generic response structure for API calls.
 */
export interface ApiResponse<T> {
  /** Response data */
  data?: T;
  
  /** Error information (if request failed) */
  error?: ApiError;
  
  /** Whether request was successful */
  success: boolean;
  
  /** Response metadata */
  metadata?: {
    /** API source */
    source: string;
    
    /** Request timestamp */
    requestedAt: number;
    
    /** Response timestamp */
    respondedAt: number;
    
    /** Whether data is from cache */
    fromCache: boolean;
  };
}

/**
 * CoinGecko API Response
 * 
 * Structure of CoinGecko historical price API response.
 */
export interface CoinGeckoResponse {
  /** Array of [timestamp, price] tuples */
  prices: [number, number][];
  
  /** Optional market cap data */
  market_caps?: [number, number][];
  
  /** Optional volume data */
  total_volumes?: [number, number][];
}

/**
 * CoinGecko API parameters
 */
export interface CoinGeckoParams {
  /** Cryptocurrency ID (e.g., "bitcoin", "ethereum") */
  id: string;
  
  /** Quote currency (e.g., "usd", "eur") */
  vs_currency: string;
  
  /** Start date (Unix timestamp) */
  from: number;
  
  /** End date (Unix timestamp) */
  to: number;
}

/**
 * Price API response (normalized)
 */
export type PriceApiResponse = ApiResponse<PriceDataPoint[]>;

/**
 * API error codes
 */
export enum ApiErrorCode {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_ASSET = 'INVALID_ASSET',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
