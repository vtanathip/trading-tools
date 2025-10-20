/**
 * CoinGecko API client
 * Handles price data fetching with rate limiting and caching
 */

import * as cache from './cacheManager.js';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const RATE_LIMIT_DELAY_MS = 1200; // ~50 calls/minute to be safe
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;

// Rate limiting state
let lastRequestTime = 0;

/**
 * Delay execution to respect rate limits
 * @returns {Promise<void>}
 */
async function applyRateLimit() {
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
 * @param {string} url - API endpoint URL
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<any>} API response data
 */
async function makeRequest(url, retries = MAX_RETRIES) {
  try {
    await applyRateLimit();
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === HTTP_STATUS_TOO_MANY_REQUESTS && retries > 0) {
        // Rate limited, wait and retry
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return makeRequest(url, retries - 1);
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return makeRequest(url, retries - 1);
    }
    
    throw error;
  }
}

/**
 * Convert asset pair to CoinGecko coin ID
 * @param {string} assetPair - Asset pair (e.g., "BTC-USD")
 * @returns {{coinId: string, vsCurrency: string}}
 */
function parseAssetPair(assetPair) {
  const [asset, currency] = assetPair.split('-');
  
  // Map common crypto symbols to CoinGecko IDs
  const coinIdMap = {
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
 * Get historical price data for a date range
 * @param {string} assetPair - Asset pair (e.g., "BTC-USD")
 * @param {number} fromTimestamp - Start timestamp (Unix seconds)
 * @param {number} toTimestamp - End timestamp (Unix seconds)
 * @returns {Promise<Array<{timestamp: number, price: number}>>} Historical price data
 */
export async function getHistoricalPrices(assetPair, fromTimestamp, toTimestamp) {
  // Check cache first
  const cacheKey = `historical:${assetPair}:${fromTimestamp}:${toTimestamp}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  const { coinId, vsCurrency } = parseAssetPair(assetPair);
  const url = `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart/range?vs_currency=${vsCurrency}&from=${fromTimestamp}&to=${toTimestamp}`;
  
  try {
    const data = await makeRequest(url);
    
    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error('Invalid response format from CoinGecko API');
    }
    
    // Transform data to our format
    const prices = data.prices.map(([timestamp, price]) => ({
      timestamp: Math.floor(timestamp / 1000), // Convert to seconds
      price: price,
    }));
    
    // Cache the result
    cache.set(cacheKey, prices);
    
    return prices;
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    throw new Error(`Failed to fetch historical prices for ${assetPair}: ${error.message}`);
  }
}

/**
 * Get current price for an asset
 * @param {string} assetPair - Asset pair (e.g., "BTC-USD")
 * @returns {Promise<number>} Current price
 */
export async function getCurrentPrice(assetPair) {
  // Check cache first (with shorter TTL for current prices)
  const cacheKey = `current:${assetPair}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData !== null) {
    return cachedData;
  }
  
  const { coinId, vsCurrency } = parseAssetPair(assetPair);
  const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`;
  
  try {
    const data = await makeRequest(url);
    
    if (!data[coinId] || !data[coinId][vsCurrency]) {
      throw new Error(`Price not found for ${assetPair}`);
    }
    
    const price = data[coinId][vsCurrency];
    
    // Cache for 5 minutes
    const FIVE_MINUTES_MS = 300000;
    cache.set(cacheKey, price, FIVE_MINUTES_MS);
    
    return price;
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw new Error(`Failed to fetch current price for ${assetPair}: ${error.message}`);
  }
}

/**
 * Get list of supported coins
 * @returns {Promise<Array<{id: string, symbol: string, name: string}>>} List of coins
 */
export async function getCoinsList() {
  // Check cache first
  const cacheKey = 'coins:list';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  const url = `${COINGECKO_BASE_URL}/coins/list`;
  
  try {
    const data = await makeRequest(url);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from CoinGecko API');
    }
    
    // Cache for 24 hours (coins list doesn't change often)
    cache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching coins list:', error);
    throw new Error(`Failed to fetch coins list: ${error.message}`);
  }
}

/**
 * Get price for a specific date (single point)
 * @param {string} assetPair - Asset pair (e.g., "BTC-USD")
 * @param {string} date - Date in DD-MM-YYYY format
 * @returns {Promise<number>} Price on that date
 */
export async function getPriceOnDate(assetPair, date) {
  const cacheKey = `date:${assetPair}:${date}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData !== null) {
    return cachedData;
  }
  
  const { coinId, vsCurrency } = parseAssetPair(assetPair);
  const url = `${COINGECKO_BASE_URL}/coins/${coinId}/history?date=${date}`;
  
  try {
    const data = await makeRequest(url);
    
    if (!data.market_data || !data.market_data.current_price || !data.market_data.current_price[vsCurrency]) {
      throw new Error(`Price not found for ${assetPair} on ${date}`);
    }
    
    const price = data.market_data.current_price[vsCurrency];
    
    // Cache historical date prices for 24 hours
    cache.set(cacheKey, price);
    
    return price;
  } catch (error) {
    console.error('Error fetching price on date:', error);
    throw new Error(`Failed to fetch price for ${assetPair} on ${date}: ${error.message}`);
  }
}
