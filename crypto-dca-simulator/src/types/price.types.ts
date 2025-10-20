/**
 * Price Data Types
 * 
 * Historical price data structures for cryptocurrency pricing.
 * Based on data-model.md specifications.
 */

/**
 * Price Data Point
 * 
 * Historical price data for a specific cryptocurrency at a specific date/time.
 * Source: Fetched from CoinGecko API.
 */
export interface PriceDataPoint {
  /** ISO 8601 date (YYYY-MM-DD) */
  date: string;
  
  /** Price in quote currency (USD/EUR) - must be > 0 */
  price: number;
  
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/**
 * Price data validation rules
 */
export interface PriceDataValidation {
  /** date: Must be valid ISO 8601 date */
  datePattern: RegExp;
  
  /** price: Must be number > 0 */
  priceMin: number; // 0 (exclusive)
  
  /** timestamp: Must be valid Unix timestamp */
  timestampMin: number; // 0
}
