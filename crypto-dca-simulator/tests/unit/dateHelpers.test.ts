/**
 * Unit tests for dateHelpers module
 * Tests date manipulation utilities
 */

import {
  getDaysBetween,
  addDays,
  addMonths,
  isWeekend,
  getNextBusinessDay,
  generatePurchaseDates,
  toISODateString,
  toUnixTimestamp,
  parseDate,
  formatDateRange,
  estimatePurchaseCount,
} from '../../src/utils/dateHelpers';

describe('getDaysBetween', () => {
  it('should calculate days between two dates', () => {
    expect(getDaysBetween('2024-01-01', '2024-01-10')).toBe(9);
    expect(getDaysBetween('2024-01-01', '2024-01-31')).toBe(30);
  });

  it('should handle same date', () => {
    expect(getDaysBetween('2024-01-01', '2024-01-01')).toBe(0);
  });

  it('should handle reverse order', () => {
    expect(getDaysBetween('2024-01-10', '2024-01-01')).toBe(-9);
  });

  it('should work with Date objects', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-10');
    expect(getDaysBetween(date1, date2)).toBe(9);
  });
});

describe('addDays', () => {
  it('should add days to a date', () => {
    const result = addDays('2024-01-01', 10);
    expect(result.getDate()).toBe(11);
  });

  it('should handle month transitions', () => {
    const result = addDays('2024-01-31', 1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(1);
  });

  it('should handle negative days', () => {
    const result = addDays('2024-01-10', -5);
    expect(result.getDate()).toBe(5);
  });

  it('should work with Date objects', () => {
    const date = new Date('2024-01-01');
    const result = addDays(date, 10);
    expect(result.getDate()).toBe(11);
  });
});

describe('addMonths', () => {
  it('should add months to a date', () => {
    const result = addMonths('2024-01-15', 1);
    expect(result.getMonth()).toBe(1); // February
  });

  it('should handle year transitions', () => {
    const result = addMonths('2024-11-15', 2);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0); // January
  });

  it('should handle day overflow', () => {
    // Jan 31 + 1 month should give Feb 28/29
    const result = addMonths('2024-01-31', 1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBeLessThanOrEqual(29);
  });

  it('should work with Date objects', () => {
    const date = new Date('2024-01-15');
    const result = addMonths(date, 2);
    expect(result.getMonth()).toBe(2); // March
  });
});

describe('isWeekend', () => {
  it('should identify Saturday as weekend', () => {
    const saturday = new Date('2024-01-06');
    expect(isWeekend(saturday)).toBe(true);
  });

  it('should identify Sunday as weekend', () => {
    const sunday = new Date('2024-01-07');
    expect(isWeekend(sunday)).toBe(true);
  });

  it('should identify weekdays correctly', () => {
    const monday = new Date('2024-01-08');
    const friday = new Date('2024-01-12');
    expect(isWeekend(monday)).toBe(false);
    expect(isWeekend(friday)).toBe(false);
  });

  it('should work with date strings', () => {
    expect(isWeekend('2024-01-06')).toBe(true); // Saturday
    expect(isWeekend('2024-01-08')).toBe(false); // Monday
  });
});

describe('getNextBusinessDay', () => {
  it('should return same day for weekdays', () => {
    const monday = new Date('2024-01-08');
    const result = getNextBusinessDay(monday);
    expect(result.getDate()).toBe(8);
  });

  it('should skip Saturday to Monday', () => {
    const saturday = new Date('2024-01-06');
    const result = getNextBusinessDay(saturday);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
  });

  it('should skip Sunday to Monday', () => {
    const sunday = new Date('2024-01-07');
    const result = getNextBusinessDay(sunday);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
  });
});

describe('generatePurchaseDates', () => {
  it('should generate daily purchase dates', () => {
    const dates = generatePurchaseDates('2024-01-01', '2024-01-05', 'daily');
    expect(dates).toHaveLength(5);
    expect(dates[0]?.getDate()).toBe(1);
    expect(dates[4]?.getDate()).toBe(5);
  });

  it('should generate weekly purchase dates', () => {
    const dates = generatePurchaseDates('2024-01-01', '2024-01-31', 'weekly');
    expect(dates).toHaveLength(5);
  });

  it('should generate biweekly purchase dates', () => {
    const dates = generatePurchaseDates('2024-01-01', '2024-02-29', 'biweekly');
    expect(dates.length).toBeGreaterThan(3);
  });

  it('should generate monthly purchase dates', () => {
    const dates = generatePurchaseDates('2024-01-15', '2024-06-15', 'monthly');
    expect(dates).toHaveLength(6);
  });

  it('should throw error for invalid frequency', () => {
    expect(() => {
      generatePurchaseDates('2024-01-01', '2024-01-31', 'invalid' as any);
    }).toThrow('Invalid frequency');
  });

  it('should handle single day range', () => {
    const dates = generatePurchaseDates('2024-01-01', '2024-01-01', 'daily');
    expect(dates).toHaveLength(1);
  });
});

describe('toISODateString', () => {
  it('should format date to YYYY-MM-DD', () => {
    expect(toISODateString('2024-01-05')).toBe('2024-01-05');
    expect(toISODateString('2024-12-31')).toBe('2024-12-31');
  });

  it('should pad single digit months and days', () => {
    expect(toISODateString('2024-01-05')).toBe('2024-01-05');
  });

  it('should work with Date objects', () => {
    const date = new Date('2024-01-15');
    expect(toISODateString(date)).toBe('2024-01-15');
  });

  it('should throw error for invalid dates', () => {
    expect(() => toISODateString('invalid')).toThrow('Invalid date');
  });
});

describe('toUnixTimestamp', () => {
  it('should convert date to Unix timestamp', () => {
    const timestamp = toUnixTimestamp('2024-01-01T00:00:00Z');
    expect(timestamp).toBeGreaterThan(0);
    expect(Number.isInteger(timestamp)).toBe(true);
  });

  it('should work with Date objects', () => {
    const date = new Date('2024-01-01');
    const timestamp = toUnixTimestamp(date);
    expect(timestamp).toBeGreaterThan(0);
  });

  it('should throw error for invalid dates', () => {
    expect(() => toUnixTimestamp('invalid')).toThrow('Invalid date');
  });
});

describe('parseDate', () => {
  it('should parse Date objects', () => {
    const date = new Date('2024-01-15');
    const result = parseDate(date);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(date.getTime());
  });

  it('should parse ISO date strings', () => {
    const result = parseDate('2024-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result.getMonth()).toBe(0); // January
  });

  it('should parse Unix timestamps', () => {
    const timestamp = 1704067200; // 2024-01-01
    const result = parseDate(timestamp);
    expect(result).toBeInstanceOf(Date);
  });

  it('should throw error for invalid input', () => {
    expect(() => parseDate('invalid')).toThrow('Cannot parse date');
  });
});

describe('formatDateRange', () => {
  it('should format date range', () => {
    const result = formatDateRange('2024-01-01', '2024-12-31');
    expect(result).toContain('Jan');
    expect(result).toContain('Dec');
    expect(result).toContain('2024');
    expect(result).toContain('-');
  });

  it('should work with Date objects', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-12-31');
    const result = formatDateRange(start, end);
    expect(result).toBeTruthy();
  });
});

describe('estimatePurchaseCount', () => {
  it('should estimate daily purchases', () => {
    const count = estimatePurchaseCount('2024-01-01', '2024-01-10', 'daily');
    expect(count).toBe(10);
  });

  it('should estimate weekly purchases', () => {
    const count = estimatePurchaseCount('2024-01-01', '2024-01-31', 'weekly');
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(5);
  });

  it('should estimate biweekly purchases', () => {
    const count = estimatePurchaseCount('2024-01-01', '2024-02-29', 'biweekly');
    expect(count).toBeGreaterThan(3);
  });

  it('should estimate monthly purchases', () => {
    const count = estimatePurchaseCount('2024-01-01', '2024-12-31', 'monthly');
    expect(count).toBe(12);
  });

  it('should return 0 for invalid frequency', () => {
    const count = estimatePurchaseCount('2024-01-01', '2024-12-31', 'invalid' as any);
    expect(count).toBe(0);
  });
});
