/**
 * Date manipulation and purchase schedule generation utilities
 * Handles date calculations for DCA simulation
 */

// Constants for date calculations
const MILLISECONDS_PER_DAY = 86400000; // 24 * 60 * 60 * 1000
const DAYS_IN_WEEK = 7;
const DAYS_IN_BIWEEK = 14;

/**
 * Get the number of days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days between dates
 */
export function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = end - start;
  return Math.floor(diffMs / MILLISECONDS_PER_DAY);
}

/**
 * Add days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 * @param {Date|string} date - Starting date
 * @param {number} months - Number of months to add
 * @returns {Date} New date with months added
 */
export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is a weekend
 */
export function isWeekend(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const SATURDAY = 6;
  const SUNDAY = 0;
  return dayOfWeek === SATURDAY || dayOfWeek === SUNDAY;
}

/**
 * Get the next business day (skip weekends)
 * @param {Date|string} date - Starting date
 * @returns {Date} Next business day
 */
export function getNextBusinessDay(date) {
  let result = new Date(date);
  
  while (isWeekend(result)) {
    result = addDays(result, 1);
  }
  
  return result;
}

/**
 * Generate purchase dates based on frequency
 * @param {Date|string} startDate - Start date for purchases
 * @param {Date|string} endDate - End date for purchases (default: today)
 * @param {string} frequency - Purchase frequency ('daily', 'weekly', 'biweekly', 'monthly')
 * @returns {Date[]} Array of purchase dates
 */
export function generatePurchaseDates(startDate, endDate = new Date(), frequency) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];

  // Set to beginning of day for consistent comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));

    // Calculate next date based on frequency
    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addDays(currentDate, DAYS_IN_WEEK);
        break;
      case 'biweekly':
        currentDate = addDays(currentDate, DAYS_IN_BIWEEK);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      default:
        throw new Error(`Invalid frequency: ${frequency}`);
    }
  }

  return dates;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} ISO formatted date string
 */
export function toISODateString(date) {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Convert date to Unix timestamp (seconds)
 * @param {Date|string} date - Date to convert
 * @returns {number} Unix timestamp in seconds
 */
export function toUnixTimestamp(date) {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }

  const MILLISECONDS_PER_SECOND = 1000;
  return Math.floor(d.getTime() / MILLISECONDS_PER_SECOND);
}

/**
 * Parse date from various formats to Date object
 * @param {Date|string|number} dateInput - Date input in various formats
 * @returns {Date} Parsed date object
 */
export function parseDate(dateInput) {
  if (dateInput instanceof Date) {
    return dateInput;
  }

  if (typeof dateInput === 'number') {
    // Assume Unix timestamp in seconds
    const MILLISECONDS_PER_SECOND = 1000;
    return new Date(dateInput * MILLISECONDS_PER_SECOND);
  }

  const parsed = new Date(dateInput);
  
  if (isNaN(parsed.getTime())) {
    throw new Error(`Cannot parse date: ${dateInput}`);
  }

  return parsed;
}

/**
 * Get date range in human-readable format
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted date range string
 */
export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Calculate the number of purchases for a given period and frequency
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} frequency - Purchase frequency
 * @returns {number} Estimated number of purchases
 */
export function estimatePurchaseCount(startDate, endDate, frequency) {
  const days = getDaysBetween(startDate, endDate);
  const MONTHS_PER_YEAR = 12;

  switch (frequency) {
    case 'daily':
      return days + 1; // Include both start and end dates
    case 'weekly':
      return Math.floor(days / DAYS_IN_WEEK) + 1;
    case 'biweekly':
      return Math.floor(days / DAYS_IN_BIWEEK) + 1;
    case 'monthly': {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const months =
        (end.getFullYear() - start.getFullYear()) * MONTHS_PER_YEAR +
        (end.getMonth() - start.getMonth());
      return months + 1;
    }
    default:
      return 0;
  }
}
