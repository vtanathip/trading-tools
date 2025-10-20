/**
 * DCA Purchase Types
 * 
 * Individual purchase event data with running totals.
 * Based on data-model.md specifications.
 */

/**
 * DCA Purchase Event
 * 
 * Individual purchase event showing when crypto was "bought" in simulation.
 * Includes running totals and profit/loss calculations.
 */
export interface DCAPurchase {
  /** ISO 8601 date of purchase (YYYY-MM-DD) */
  date: string;
  
  /** Price per unit at purchase time */
  price: number;
  
  /** Amount invested this purchase */
  amountInvested: number;
  
  /** Crypto quantity acquired (calculated: amountInvested / price) */
  quantityAcquired: number;
  
  /** Total invested up to this point (sum of all previous amountInvested) */
  cumulativeInvested: number;
  
  /** Total quantity acquired up to this point (sum of all previous quantityAcquired) */
  cumulativeQuantity: number;
  
  /** Current portfolio value at this purchase date (cumulativeQuantity * currentPrice) */
  portfolioValue: number;
  
  /** Cumulative profit/loss at this purchase date (portfolioValue - cumulativeInvested) */
  profitLoss: number;
  
  /** Cumulative profit/loss percentage ((profitLoss / cumulativeInvested) * 100) */
  profitLossPercent: number;
}

/**
 * Calculated fields formulas (for reference)
 */
export interface DCAPurchaseCalculations {
  quantityAcquired: 'amountInvested / price';
  cumulativeInvested: 'sum(all previous amountInvested)';
  cumulativeQuantity: 'sum(all previous quantityAcquired)';
  portfolioValue: 'cumulativeQuantity * currentPrice';
  profitLoss: 'portfolioValue - cumulativeInvested';
  profitLossPercent: '(profitLoss / cumulativeInvested) * 100';
}
