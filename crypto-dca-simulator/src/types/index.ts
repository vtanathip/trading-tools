/**
 * Type Definitions Index
 * 
 * Central export point for all TypeScript type definitions.
 * Import from this file to access any type in the application.
 * 
 * @example
 * ```typescript
 * import { SimulationConfig, DCAPurchase, PriceDataPoint } from '@/types';
 * ```
 */

// Simulation types
export type {
  DCAFrequency,
  SimulationConfig,
  SimulationConfigValidation,
} from './simulation.types';

// Price types
export type {
  PriceDataPoint,
  PriceDataValidation,
} from './price.types';

// Purchase types
export type {
  DCAPurchase,
  DCAPurchaseCalculations,
} from './purchase.types';

// Results types
export type {
  SimulationResults,
  AssetComparison,
  AssetComparisonConstraints,
} from './results.types';

// Cache types
export type {
  CacheMetadata,
  CacheEntry,
  CacheConfig,
  LocalStorageSchema,
  CacheValidationFn,
  CacheEvictionFn,
} from './cache.types';

// API types
export type {
  ApiError,
  ApiResponse,
  CoinGeckoResponse,
  CoinGeckoParams,
  PriceApiResponse,
} from './api.types';

export { ApiErrorCode } from './api.types';

// Validation types
export type {
  ValidationError,
  ValidationResult,
  FieldValidator,
  ValidationRules,
} from './validation.types';

export { ValidationErrorCode } from './validation.types';
