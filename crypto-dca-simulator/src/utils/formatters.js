/**
 * Number and currency formatting utilities
 * Provides consistent formatting across the application
 */

/**
 * Format number as currency (USD by default)
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD', decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    // Fallback if currency not supported
    return `$${formatNumber(value, decimals)}`;
  }
}

/**
 * Format number with comma separators
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage value
 * @param {number} value - Percentage value (e.g., 25.5 for 25.5%)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }

  return `${formatNumber(value, decimals)}%`;
}

// Constants for crypto precision
const CRYPTO_DECIMALS = {
  BTC_PRECISION: 8,
  ETH_PRECISION: 6,
  DEFAULT_PRECISION: 4,
};

/**
 * Format cryptocurrency quantity with appropriate precision
 * @param {number} value - Quantity to format
 * @param {string} asset - Asset symbol (e.g., 'BTC', 'ETH')
 * @returns {string} Formatted quantity string
 */
export function formatCryptoQuantity(value, asset = 'BTC') {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  // Bitcoin and similar: 8 decimal places
  const btcLike = ['BTC', 'BCH', 'LTC'];
  // Ethereum and similar: 6 decimal places
  const ethLike = ['ETH', 'BNB'];
  
  let decimals = CRYPTO_DECIMALS.DEFAULT_PRECISION;
  
  if (btcLike.includes(asset)) {
    decimals = CRYPTO_DECIMALS.BTC_PRECISION;
  } else if (ethLike.includes(asset)) {
    decimals = CRYPTO_DECIMALS.ETH_PRECISION;
  }

  // Remove trailing zeros
  const formatted = value.toFixed(decimals);
  return formatted.replace(/\.?0+$/, '');
}

// Constants for compact number formatting
const COMPACT_NUMBER_THRESHOLDS = {
  BILLION: 1000000000,
  MILLION: 1000000,
  THOUSAND: 1000,
};

/**
 * Format large numbers with compact notation (K, M, B)
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted compact number string
 */
export function formatCompactNumber(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);

  if (absValue >= COMPACT_NUMBER_THRESHOLDS.BILLION) {
    return `${(value / COMPACT_NUMBER_THRESHOLDS.BILLION).toFixed(decimals)}B`;
  }
  if (absValue >= COMPACT_NUMBER_THRESHOLDS.MILLION) {
    return `${(value / COMPACT_NUMBER_THRESHOLDS.MILLION).toFixed(decimals)}M`;
  }
  if (absValue >= COMPACT_NUMBER_THRESHOLDS.THOUSAND) {
    return `${(value / COMPACT_NUMBER_THRESHOLDS.THOUSAND).toFixed(decimals)}K`;
  }

  return formatNumber(value, decimals);
}

/**
 * Format date to locale string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format style ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'medium') {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
  };

  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string (e.g., "$1,234.56")
 * @returns {number} Parsed number value
 */
export function parseCurrency(currencyString) {
  if (!currencyString) {
    return 0;
  }

  // Remove currency symbols and commas
  const cleaned = String(currencyString).replace(/[$,€£¥]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}
