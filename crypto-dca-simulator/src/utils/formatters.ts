/**
 * Number and currency formatting utilities
 * Provides consistent formatting across the application
 */

/**
 * Format number as currency (USD by default)
 * @param value - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD', decimals: number = 2): string {
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
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
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
 * @param value - Percentage value (e.g., 25.5 for 25.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
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
} as const;

/**
 * Format cryptocurrency quantity with appropriate precision
 * @param value - Quantity to format
 * @param asset - Asset symbol (e.g., 'BTC', 'ETH')
 * @returns Formatted quantity string
 */
export function formatCryptoQuantity(value: number, asset: string = 'BTC'): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  // Bitcoin and similar: 8 decimal places
  const btcLike = ['BTC', 'BCH', 'LTC'];
  // Ethereum and similar: 6 decimal places
  const ethLike = ['ETH', 'BNB'];
  
  let decimals: number = CRYPTO_DECIMALS.DEFAULT_PRECISION;
  
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
} as const;

/**
 * Format large numbers with compact notation (K, M, B)
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted compact number string
 */
export function formatCompactNumber(value: number, decimals: number = 1): string {
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
 * Date format options
 */
type DateFormat = 'short' | 'medium' | 'long';

/**
 * Format date to locale string
 * @param date - Date to format
 * @param format - Format style ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, format: DateFormat = 'medium'): string {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const options: Record<DateFormat, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
  };

  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
}

/**
 * Parse currency string to number
 * @param currencyString - Currency string (e.g., "$1,234.56")
 * @returns Parsed number value
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) {
    return 0;
  }

  // Remove currency symbols and commas
  const cleaned = String(currencyString).replace(/[$,€£¥]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}
