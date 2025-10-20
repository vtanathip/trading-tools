/**
 * CoinGecko API client
 * Handles price data fetching with rate limiting and caching
 */

import * as cache from './cacheManager';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const RATE_LIMIT_DELAY_MS = 1200; // ~50 calls/minute to be safe
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;
const FIVE_MINUTES_MS = 300000;

/**
 * Historical price data point
 */
export interface HistoricalPrice {
  timestamp: number;
  price: number;
}

/**
 * Coin information
 */
export interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
}

/**
 * Parsed asset pair components
 */
interface AssetPairComponents {
  coinId: string;
  vsCurrency: string;
}

// Rate limiting state
let lastRequestTime = 0;

/**
 * Delay execution to respect rate limits
 * @returns Promise that resolves after rate limit delay
 */
async function applyRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
    const delay = RATE_LIMIT_DELAY_MS - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Make API request with retry logic
 * @param url - API endpoint URL
 * @param retries - Number of retries remaining
 * @returns API response data
 */
async function makeRequest<T>(url: string, retries: number = MAX_RETRIES): Promise<T> {
  try {
    await applyRateLimit();
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === HTTP_STATUS_TOO_MANY_REQUESTS && retries > 0) {
        // Rate limited, wait and retry
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return makeRequest<T>(url, retries - 1);
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return makeRequest<T>(url, retries - 1);
    }
    
    throw error;
  }
}

/**
 * Convert asset pair to CoinGecko coin ID
 * @param assetPair - Asset pair (e.g., "BTC-USD")
 * @returns Coin ID and vs currency
 */
function parseAssetPair(assetPair: string): AssetPairComponents {
  const parts = assetPair.split('-');
  
  if (parts.length !== 2) {
    throw new Error(`Invalid asset pair format: ${assetPair}. Expected format: ASSET-CURRENCY`);
  }
  
  const asset = parts[0];
  const currency = parts[1];
  
  if (!asset || !currency) {
    throw new Error(`Invalid asset pair format: ${assetPair}. Both asset and currency are required.`);
  }
  
  // Map common crypto symbols to CoinGecko IDs
  const coinIdMap: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    BNB: 'binancecoin',
    ADA: 'cardano',
    SOL: 'solana',
    XRP: 'ripple',
    DOT: 'polkadot',
    DOGE: 'dogecoin',
    AVAX: 'avalanche-2',
    MATIC: 'matic-network',
    LINK: 'chainlink',
    UNI: 'uniswap',
    LTC: 'litecoin',
    BCH: 'bitcoin-cash',
  };
  
  const coinId = coinIdMap[asset] || asset.toLowerCase();
  const vsCurrency = currency.toLowerCase();
  
  return { coinId, vsCurrency };
}

/**
 * CoinGecko market chart response format
 */
interface CoinGeckoMarketChartResponse {
  prices: [number, number][];
  market_caps?: [number, number][];
  total_volumes?: [number, number][];
}

/**
 * Get historical price data for a date range
 * @param assetPair - Asset pair (e.g., "BTC-USD")
 * @param fromTimestamp - Start timestamp (Unix seconds)
 * @param toTimestamp - End timestamp (Unix seconds)
 * @returns Historical price data
 */
export async function getHistoricalPrices(
  assetPair: string,
  fromTimestamp: number,
  toTimestamp: number
): Promise<HistoricalPrice[]> {
  // Check cache first
  const cacheKey = `historical:${assetPair}:${fromTimestamp}:${toTimestamp}`;
  const cachedData = cache.get<HistoricalPrice[]>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  const { coinId, vsCurrency } = parseAssetPair(assetPair);
  const url = `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart/range?vs_currency=${vsCurrency}&from=${fromTimestamp}&to=${toTimestamp}`;
  
  try {
    const data = await makeRequest<CoinGeckoMarketChartResponse>(url);
    
    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error('Invalid response format from CoinGecko API');
    }
    
    // Transform data to our format
    const prices: HistoricalPrice[] = data.prices.map(([timestamp, price]) => ({
      timestamp: Math.floor(timestamp / 1000), // Convert to seconds
      price: price,
    }));
    
    // Cache the result
    cache.set(cacheKey, prices);
    
    return prices;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching historical prices:', error);
    throw new Error(`Failed to fetch historical prices for ${assetPair}: ${errorMessage}`);
  }
}

/**
 * CoinGecko simple price response format
 */
type CoinGeckoSimplePriceResponse = Record<string, Record<string, number>>;

/**
 * Get current price for an asset
 * @param assetPair - Asset pair (e.g., "BTC-USD")
 * @returns Current price
 */
export async function getCurrentPrice(assetPair: string): Promise<number> {
  // Check cache first (with shorter TTL for current prices)
  const cacheKey = `current:${assetPair}`;
  const cachedData = cache.get<number>(cacheKey);
  
  if (cachedData !== null) {
    return cachedData;
  }
  
  const { coinId, vsCurrency } = parseAssetPair(assetPair);
  const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`;
  
  try {
    const data = await makeRequest<CoinGeckoSimplePriceResponse>(url);
    
    if (!data[coinId] || !data[coinId][vsCurrency]) {
      throw new Error(`Price not found for ${assetPair}`);
    }
    
    const price = data[coinId][vsCurrency];
    
    // Cache for 5 minutes
    cache.set(cacheKey, price, FIVE_MINUTES_MS);
    
    return price;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching current price:', error);
    throw new Error(`Failed to fetch current price for ${assetPair}: ${errorMessage}`);
  }
}

/**
 * Get list of supported coins
 * @returns List of coins
 */
export async function getCoinsList(): Promise<CoinInfo[]> {
  // Check cache first
  const cacheKey = 'coins:list';
  const cachedData = cache.get<CoinInfo[]>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  const url = `${COINGECKO_BASE_URL}/coins/list`;
  
  try {
    const data = await makeRequest<CoinInfo[]>(url);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from CoinGecko API');
    }
    
    // Cache for 24 hours (coins list doesn't change often)
    cache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching coins list:', error);
    throw new Error(`Failed to fetch coins list: ${errorMessage}`);
  }
}

/**
 * CoinGecko history response format
 */
interface CoinGeckoHistoryResponse {
  market_data?: {
    current_price?: Record<string, number>;
  };
}

/**
 * Get price for a specific date (single point)
 * @param assetPair - Asset pair (e.g., "BTC-USD")
 * @param date - Date in DD-MM-YYYY format
 * @returns Price on that date
 */
export async function getPriceOnDate(assetPair: string, date: string): Promise<number> {
  const cacheKey = `date:${assetPair}:${date}`;
  const cachedData = cache.get<number>(cacheKey);
  
  if (cachedData !== null) {
    return cachedData;
  }
  
  const { coinId, vsCurrency } = parseAssetPair(assetPair);
  const url = `${COINGECKO_BASE_URL}/coins/${coinId}/history?date=${date}`;
  
  try {
    const data = await makeRequest<CoinGeckoHistoryResponse>(url);
    
    if (!data.market_data || !data.market_data.current_price || !data.market_data.current_price[vsCurrency]) {
      throw new Error(`Price not found for ${assetPair} on ${date}`);
    }
    
    const price = data.market_data.current_price[vsCurrency];
    
    // Cache historical date prices for 24 hours
    cache.set(cacheKey, price);
    
    return price;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching price on date:', error);
    throw new Error(`Failed to fetch price for ${assetPair} on ${date}: ${errorMessage}`);
  }
}
