/**
 * Input validation utilities
 * Validates user input according to specification requirements
 */

const VALID_ASSET_PAIR_PATTERN = /^[A-Z]{3,5}-[A-Z]{3}$/;
const MIN_INVESTMENT = 1;
const MAX_INVESTMENT = 1000000;
const VALID_FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly'];

/**
 * Validate asset pair format
 * @param {string} assetPair - Asset pair to validate (e.g., "BTC-USD")
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateAssetPair(assetPair) {
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
 * @param {number} amount - Investment amount to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateInvestmentAmount(amount) {
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
 * @param {string} frequency - Frequency to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateFrequency(frequency) {
  if (!frequency) {
    return { valid: false, error: 'Frequency is required' };
  }

  if (!VALID_FREQUENCIES.includes(frequency)) {
    return {
      valid: false,
      error: `Frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate date string and check if it's not in the future
 * @param {string} dateString - Date string to validate (ISO 8601 format)
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateStartDate(dateString) {
  if (!dateString) {
    return { valid: false, error: 'Start date is required' };
  }

  const date = new Date(dateString);

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
 * Validate complete simulation configuration
 * @param {Object} config - Simulation configuration object
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateSimulationConfig(config) {
  const errors = {};

  const assetValidation = validateAssetPair(config.assetPair);
  if (!assetValidation.valid) {
    errors.assetPair = assetValidation.error;
  }

  const dateValidation = validateStartDate(config.startDate);
  if (!dateValidation.valid) {
    errors.startDate = dateValidation.error;
  }

  const amountValidation = validateInvestmentAmount(config.investmentAmount);
  if (!amountValidation.valid) {
    errors.investmentAmount = amountValidation.error;
  }

  const frequencyValidation = validateFrequency(config.frequency);
  if (!frequencyValidation.valid) {
    errors.frequency = frequencyValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
