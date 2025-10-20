/**
 * Simulation Results Types
 * 
 * Complete simulation output with all calculations and metadata.
 * Based on data-model.md specifications.
 */

import type { SimulationConfig } from './simulation.types';
import type { DCAPurchase } from './purchase.types';

/**
 * Simulation Results
 * 
 * Complete simulation output with all calculations.
 * Contains configuration, all purchase events, and summary metrics.
 */
export interface SimulationResults {
  /** Original simulation configuration */
  config: SimulationConfig;
  
  /** Array of all purchase events in chronological order */
  purchases: DCAPurchase[];
  
  /* Summary Metrics */
  
  /** Total amount invested across all purchases */
  totalInvested: number;
  
  /** Current portfolio value at latest price */
  currentValue: number;
  
  /** Total cryptocurrency quantity acquired */
  totalQuantity: number;
  
  /** Total profit/loss (currentValue - totalInvested) */
  profitLoss: number;
  
  /** Total profit/loss percentage ((profitLoss / totalInvested) * 100) */
  profitLossPercent: number;
  
  /** Average purchase price (totalInvested / totalQuantity) */
  averagePrice: number;
  
  /** Latest cryptocurrency price */
  currentPrice: number;
  
  /* Metadata */
  
  /** When calculation was performed (Unix timestamp ms) */
  calculatedAt: number;
  
  /** API source (e.g., "CoinGecko") */
  dataSource: string;
  
  /** Actual first purchase date (may differ from config.startDate if data missing) */
  firstPurchaseDate: string;
  
  /** Actual last purchase date */
  lastPurchaseDate: string;
  
  /** Count of purchase events */
  totalPurchases: number;
}

/**
 * Asset Comparison
 * 
 * Collection of multiple simulations for comparison.
 * Maximum 5 simulations per comparison (FR-011).
 */
export interface AssetComparison {
  /** Map of asset pair to simulation results */
  simulations: Map<string, SimulationResults>;
  
  /** Shared configuration across all simulations (same date, amount, frequency) */
  baseConfig: Partial<SimulationConfig>;
  
  /** When comparison was created (Unix timestamp ms) */
  comparisonDate: number;
}

/**
 * Asset comparison constraints
 */
export interface AssetComparisonConstraints {
  /** Maximum simulations per comparison (FR-011) */
  maxSimulations: 5;
  
  /** All simulations must share same startDate, investmentAmount, and frequency */
  sharedConfigFields: readonly ['startDate', 'investmentAmount', 'frequency'];
}
