/**
 * DCA Calculator - Core simulation logic
 * Calculates DCA investment results with 100% test coverage requirement
 */

import * as priceApi from './priceApi';
import * as dateHelpers from '../utils/dateHelpers';

/**
 * DCA calculation configuration
 */
export interface DCAConfig {
  assetPair: string;
  startDate: string; // ISO date format
  investmentAmount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  endDate?: string; // ISO date format, optional
}

/**
 * Individual purchase record
 */
export interface DCAPurchase {
  date: string; // ISO date string
  timestamp: number; // Unix timestamp in seconds
  price: number;
  quantity: number;
  invested: number;
  runningTotal: number;
  runningInvested?: number;
  runningProfitLoss?: number;
}

/**
 * Investment metrics
 */
export interface DCAMetrics {
  totalInvested: number;
  totalQuantity: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  averagePrice: number;
  currentPrice: number;
  purchases: DCAPurchase[];
}

/**
 * Complete simulation results
 */
export interface DCAResults {
  purchases: DCAPurchase[];
  metrics: DCAMetrics;
  currentPrice: number;
  totalPurchases: number;
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Summary statistics for visualization
 */
export interface SummaryStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  priceVolatility: number;
}

/**
 * Calculate DCA investment results
 * @param config - Simulation configuration
 * @returns Simulation results
 */
export async function calculateDCA(config: DCAConfig): Promise<DCAResults> {
  const {
    assetPair,
    startDate,
    investmentAmount,
    frequency,
    endDate = new Date().toISOString().split('T')[0],
  } = config;

  // Ensure endDate is always a string
  const finalEndDate: string = endDate as string; // endDate is now guaranteed to be a string after default

  // Generate purchase dates
  const purchaseDates = dateHelpers.generatePurchaseDates(startDate, finalEndDate, frequency);

  if (purchaseDates.length === 0) {
    throw new Error('No purchase dates generated. Check your date range and frequency.');
  }

  // Fetch historical prices
  const firstDate = purchaseDates[0];
  const lastDate = purchaseDates[purchaseDates.length - 1];
  
  /* istanbul ignore next - Defensive check, already validated purchaseDates.length > 0 */
  if (!firstDate || !lastDate) {
    throw new Error('Invalid purchase dates range.');
  }
  
  const fromTimestamp = dateHelpers.toUnixTimestamp(firstDate);
  const toTimestamp = dateHelpers.toUnixTimestamp(lastDate);

  const historicalPrices = await priceApi.getHistoricalPrices(
    assetPair,
    fromTimestamp,
    toTimestamp
  );

  // Calculate purchases
  const purchases = calculatePurchases(
    purchaseDates,
    historicalPrices,
    investmentAmount
  );

  // Get current price for final valuation
  const currentPrice = await priceApi.getCurrentPrice(assetPair);

  // Calculate metrics
  const metrics = calculateMetrics(purchases, currentPrice, investmentAmount);

  return {
    purchases: metrics.purchases, // Use purchases with calculated running totals
    metrics,
    currentPrice,
    totalPurchases: metrics.purchases.length,
    dateRange: {
      start: startDate,
      end: finalEndDate,
    },
  };
}

/**
 * Calculate individual purchases with quantities
 * @param purchaseDates - Array of purchase dates
 * @param historicalPrices - Price history
 * @param investmentAmount - Amount per purchase
 * @returns Array of purchase records
 */
function calculatePurchases(
  purchaseDates: Date[],
  historicalPrices: priceApi.HistoricalPrice[],
  investmentAmount: number
): DCAPurchase[] {
  return purchaseDates.map((date) => {
    const timestamp = dateHelpers.toUnixTimestamp(date);
    const price = findClosestPrice(timestamp, historicalPrices);

    if (!price) {
      throw new Error(`No price data found for ${date.toISOString()}`);
    }

    const quantity = investmentAmount / price;
    const runningTotal = 0; // Will be calculated in next step

    return {
      date: dateHelpers.toISODateString(date),
      timestamp,
      price,
      quantity,
      invested: investmentAmount,
      runningTotal,
    };
  });
}

/**
 * Find closest price for a given timestamp
 * @param targetTimestamp - Target timestamp in seconds
 * @param prices - Array of price data
 * @returns Closest price or null if not found
 */
function findClosestPrice(
  targetTimestamp: number,
  prices: priceApi.HistoricalPrice[]
): number | null {
  if (!prices || prices.length === 0) {
    return null;
  }

  // Binary search for closest price
  const firstPrice = prices[0];
  
  /* istanbul ignore next - Defensive check, already validated prices.length > 0 */
  if (!firstPrice) {
    return null;
  }
  
  let closest = firstPrice;
  let minDiff = Math.abs(firstPrice.timestamp - targetTimestamp);

  for (const priceData of prices) {
    const diff = Math.abs(priceData.timestamp - targetTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = priceData;
    }
  }

  return closest.price;
}

/**
 * Calculate investment metrics
 * @param purchases - Array of purchase records
 * @param currentPrice - Current asset price
 * @param investmentAmount - Amount per purchase
 * @returns Investment metrics
 */
function calculateMetrics(
  purchases: DCAPurchase[],
  currentPrice: number,
  investmentAmount: number
): DCAMetrics {
  const totalInvested = purchases.length * investmentAmount;
  const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);
  const currentValue = totalQuantity * currentPrice;
  const profitLoss = currentValue - totalInvested;
  const profitLossPercent = (profitLoss / totalInvested) * 100;

  // Calculate average purchase price
  const averagePrice = totalInvested / totalQuantity;

  // Calculate running totals for each purchase
  let runningQuantity = 0;
  let runningInvested = 0;
  const purchasesWithRunningTotal = purchases.map((purchase) => {
    runningQuantity += purchase.quantity;
    runningInvested += purchase.invested;
    // Use the CURRENT price at this point in time, not the final currentPrice
    const runningValue = runningQuantity * purchase.price;

    return {
      ...purchase,
      runningTotal: runningValue,
      runningInvested,
      runningProfitLoss: runningValue - runningInvested,
    };
  });

  return {
    totalInvested,
    totalQuantity,
    currentValue,
    profitLoss,
    profitLossPercent,
    averagePrice,
    currentPrice,
    purchases: purchasesWithRunningTotal,
  };
}

/**
 * Calculate summary statistics for visualization
 * @param purchases - Array of purchase records
 * @returns Summary statistics
 */
export function calculateSummaryStats(purchases: DCAPurchase[]): SummaryStats {
  if (!purchases || purchases.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      priceVolatility: 0,
    };
  }

  const prices = purchases.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  // Calculate standard deviation for volatility
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  const priceVolatility = (stdDev / avgPrice) * 100;

  return {
    minPrice,
    maxPrice,
    avgPrice,
    priceVolatility,
  };
}

/**
 * Validate calculation configuration
 * @param config - Configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateCalculationConfig(config: Partial<DCAConfig>): void {
  if (!config) {
    throw new Error('Configuration is required');
  }

  const { assetPair, startDate, investmentAmount, frequency } = config;

  if (!assetPair) {
    throw new Error('Asset pair is required');
  }

  if (!startDate) {
    throw new Error('Start date is required');
  }

  if (!investmentAmount || investmentAmount <= 0) {
    throw new Error('Investment amount must be greater than 0');
  }

  if (!frequency) {
    throw new Error('Frequency is required');
  }

  const validFrequencies: Array<DCAConfig['frequency']> = ['daily', 'weekly', 'biweekly', 'monthly'];
  if (!validFrequencies.includes(frequency)) {
    throw new Error(`Frequency must be one of: ${validFrequencies.join(', ')}`);
  }
}
