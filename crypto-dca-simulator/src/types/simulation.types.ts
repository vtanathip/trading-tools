/**
 * Simulation Configuration Types
 * 
 * Core types for DCA simulation parameters and configuration.
 * Based on data-model.md specifications.
 */

/**
 * Dollar-Cost Averaging frequency options
 */
export type DCAFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

/**
 * DCA Simulation Configuration
 * 
 * Represents the user's simulation parameters.
 * Immutable once created (new simulation = new object).
 */
export interface SimulationConfig {
  /** Unique identifier for tracking */
  id: string;
  
  /** Asset pair (e.g., "BTC-USD", "ETH-EUR") */
  assetPair: string;
  
  /** Simulation start date in ISO 8601 format: "YYYY-MM-DD" */
  startDate: string;
  
  /** Investment amount per DCA interval in base currency (USD/EUR) */
  investmentAmount: number;
  
  /** Purchase frequency */
  frequency: DCAFrequency;
  
  /** Timestamp when configuration was created */
  createdAt: number;
}

/**
 * Validation rules for SimulationConfig
 */
export interface SimulationConfigValidation {
  /** assetPair: Must match pattern ^[A-Z]{3,5}-[A-Z]{3}$ */
  assetPairPattern: RegExp;
  
  /** startDate: Must be valid ISO 8601 date, not in future, within available historical data range */
  startDateMin: string; // "2010-01-01"
  startDateMax: string; // today
  
  /** investmentAmount: Must be number >= 1 and <= 1,000,000 */
  investmentAmountMin: number; // 1
  investmentAmountMax: number; // 1000000
  
  /** frequency: Must be one of DCAFrequency enum values */
  validFrequencies: readonly DCAFrequency[];
}
