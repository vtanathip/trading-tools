/**
 * Input validation utilities
 * Validates user input according to specification requirements
 */

import type { DCAFrequency } from '../types';

const VALID_ASSET_PAIR_PATTERN = /^[A-Z]{3,5}-[A-Z]{3}$/;
const MIN_INVESTMENT = 1;
const MAX_INVESTMENT = 1000000;
const VALID_FREQUENCIES: readonly DCAFrequency[] = ['daily', 'weekly', 'biweekly', 'monthly'];

/**
 * Validate asset pair format
 * @param assetPair - Asset pair to validate (e.g., "BTC-USD")
 * @returns Validation result with error message if invalid
 */
export function validateAssetPair(assetPair: unknown): { valid: boolean; error: string | null } {
  if (!assetPair || typeof assetPair !== 'string') {
    return { valid: false, error: 'Asset pair is required' };
  }

  if (!VALID_ASSET_PAIR_PATTERN.test(assetPair)) {
    return {
      valid: false,
      error: 'Asset pair must be in format XXX-YYY (e.g., BTC-USD, ETH-EUR)',
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate investment amount
 * @param amount - Investment amount to validate
 * @returns Validation result with error message if invalid
 */
export function validateInvestmentAmount(amount: unknown): { valid: boolean; error: string | null } {
  if (amount === null || amount === undefined) {
    return { valid: false, error: 'Investment amount is required' };
  }

  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    return { valid: false, error: 'Investment amount must be a number' };
  }

  if (numAmount < MIN_INVESTMENT) {
    return { valid: false, error: `Investment amount must be at least $${MIN_INVESTMENT}` };
  }

  if (numAmount > MAX_INVESTMENT) {
    return {
      valid: false,
      error: `Investment amount cannot exceed $${MAX_INVESTMENT.toLocaleString()}`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate DCA frequency
 * @param frequency - Frequency to validate
 * @returns Validation result with error message if invalid
 */
export function validateFrequency(frequency: unknown): { valid: boolean; error: string | null } {
  if (!frequency) {
    return { valid: false, error: 'Frequency is required' };
  }

  if (!VALID_FREQUENCIES.includes(frequency as DCAFrequency)) {
    return {
      valid: false,
      error: `Frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate date string and check if it's not in the future
 * @param dateString - Date string to validate (ISO 8601 format)
 * @returns Validation result with error message if invalid
 */
export function validateStartDate(dateString: unknown): { valid: boolean; error: string | null } {
  if (!dateString) {
    return { valid: false, error: 'Start date is required' };
  }

  const date = new Date(dateString as string);

  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Compare dates only, not times

  if (date > now) {
    return { valid: false, error: 'Cannot simulate future dates' };
  }

  // Check if date is reasonable (not too far in the past)
  const minDate = new Date('2010-01-01');
  if (date < minDate) {
    return {
      valid: false,
      error: 'Start date must be after January 1, 2010 (historical data limitation)',
    };
  }

  return { valid: true, error: null };
}

/**
 * Simulation configuration for validation
 */
export interface SimulationConfigInput {
  assetPair?: unknown;
  startDate?: unknown;
  investmentAmount?: unknown;
  frequency?: unknown;
}

/**
 * Validation errors object
 */
export interface ValidationErrors {
  assetPair?: string;
  startDate?: string;
  investmentAmount?: string;
  frequency?: string;
}

/**
 * Validate complete simulation configuration
 * @param config - Simulation configuration object
 * @returns Validation result with errors object
 */
export function validateSimulationConfig(config: SimulationConfigInput): {
  valid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  const assetValidation = validateAssetPair(config.assetPair);
  if (!assetValidation.valid) {
    errors.assetPair = assetValidation.error || undefined;
  }

  const dateValidation = validateStartDate(config.startDate);
  if (!dateValidation.valid) {
    errors.startDate = dateValidation.error || undefined;
  }

  const amountValidation = validateInvestmentAmount(config.investmentAmount);
  if (!amountValidation.valid) {
    errors.investmentAmount = amountValidation.error || undefined;
  }

  const frequencyValidation = validateFrequency(config.frequency);
  if (!frequencyValidation.valid) {
    errors.frequency = frequencyValidation.error || undefined;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
