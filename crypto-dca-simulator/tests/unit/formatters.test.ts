/**
 * Unit tests for formatters module
 * Tests number and date formatting utilities
 */

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatCryptoQuantity,
  formatCompactNumber,
  formatDate,
  parseCurrency,
} from '../../src/utils/formatters';

describe('formatCurrency', () => {
  it('should format USD currency with default decimals', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format EUR currency', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('should handle custom decimal places', () => {
    expect(formatCurrency(1234.567, 'USD', 3)).toBe('$1,234.567');
    expect(formatCurrency(1234, 'USD', 0)).toBe('$1,234');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('should handle zero and edge cases', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(null as any)).toBe('$0.00');
    expect(formatCurrency(undefined as any)).toBe('$0.00');
    expect(formatCurrency(NaN)).toBe('$0.00');
  });

  it('should format large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatNumber', () => {
  it('should format numbers with default decimals', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(0)).toBe('0.00');
  });

  it('should format numbers with comma separators', () => {
    expect(formatNumber(1000000)).toBe('1,000,000.00');
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('should handle custom decimal places', () => {
    expect(formatNumber(1234.567, 3)).toBe('1,234.567');
    expect(formatNumber(1234, 0)).toBe('1,234');
  });

  it('should handle edge cases', () => {
    expect(formatNumber(null as any)).toBe('0.00');
    expect(formatNumber(undefined as any)).toBe('0.00');
    expect(formatNumber(NaN)).toBe('0.00');
  });
});

describe('formatPercentage', () => {
  it('should format positive percentages', () => {
    expect(formatPercentage(25)).toBe('25.00%');
    expect(formatPercentage(100)).toBe('100.00%');
  });

  it('should format negative percentages', () => {
    expect(formatPercentage(-15.5)).toBe('-15.50%');
  });

  it('should handle custom decimal places', () => {
    expect(formatPercentage(25.123, 3)).toBe('25.123%');
    expect(formatPercentage(25, 0)).toBe('25%');
  });

  it('should handle edge cases', () => {
    expect(formatPercentage(0)).toBe('0.00%');
    expect(formatPercentage(null as any)).toBe('0.00%');
    expect(formatPercentage(undefined as any)).toBe('0.00%');
    expect(formatPercentage(NaN)).toBe('0.00%');
  });

  it('should format very small percentages', () => {
    expect(formatPercentage(0.01)).toBe('0.01%');
  });
});

describe('formatCryptoQuantity', () => {
  it('should format BTC with 8 decimals', () => {
    expect(formatCryptoQuantity(0.12345678, 'BTC')).toBe('0.12345678');
  });

  it('should format ETH with 6 decimals', () => {
    expect(formatCryptoQuantity(1.234567, 'ETH')).toBe('1.234567');
  });

  it('should remove trailing zeros', () => {
    expect(formatCryptoQuantity(1.0, 'BTC')).toBe('1');
    expect(formatCryptoQuantity(0.10000000, 'BTC')).toBe('0.1');
  });

  it('should handle very small amounts', () => {
    expect(formatCryptoQuantity(0.00000001, 'BTC')).toBe('0.00000001');
  });

  it('should handle default decimals for unknown symbols', () => {
    expect(formatCryptoQuantity(1.2345, 'DOGE')).toBe('1.2345');
    expect(formatCryptoQuantity(1.23456789, 'LTC')).toBe('1.23456789');
  });

  it('should handle edge cases', () => {
    expect(formatCryptoQuantity(0, 'BTC')).toBe('0');
    expect(formatCryptoQuantity(null as any)).toBe('0');
  });
});

describe('formatCompactNumber', () => {
  it('should format thousands with K suffix', () => {
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(10000)).toBe('10.0K');
  });

  it('should format millions with M suffix', () => {
    expect(formatCompactNumber(1500000)).toBe('1.5M');
    expect(formatCompactNumber(10000000)).toBe('10.0M');
  });

  it('should format billions with B suffix', () => {
    expect(formatCompactNumber(1500000000)).toBe('1.5B');
    expect(formatCompactNumber(10000000000)).toBe('10.0B');
  });

  it('should not format numbers below 1000', () => {
    expect(formatCompactNumber(999)).toBe('999.0');
    expect(formatCompactNumber(100)).toBe('100.0');
  });

  it('should handle negative numbers', () => {
    expect(formatCompactNumber(-1500)).toBe('-1.5K');
    expect(formatCompactNumber(-1500000)).toBe('-1.5M');
  });

  it('should respect decimal places', () => {
    expect(formatCompactNumber(1555, 0)).toBe('2K');
    expect(formatCompactNumber(1555, 2)).toBe('1.56K');
  });

  it('should handle edge cases', () => {
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(null as any)).toBe('0');
  });
});

describe('formatDate', () => {
  it('should format dates in medium style', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date);
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format dates in short style', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date, 'short');
    expect(result).toContain('01');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format dates in long style', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date, 'long');
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should handle string dates', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid Date');
  });

  it('should handle timestamp dates', () => {
    const timestamp = new Date('2024-01-15').getTime();
    const result = formatDate(timestamp);
    expect(result).toBeTruthy();
  });

  it('should handle invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
    expect(formatDate(null as any)).toBe('');
  });
});

describe('parseCurrency', () => {
  it('should parse currency strings to numbers', () => {
    expect(parseCurrency('$1,234.56')).toBe(1234.56);
    expect(parseCurrency('€1,000.00')).toBe(1000.00);
    expect(parseCurrency('£999.99')).toBe(999.99);
  });

  it('should handle plain numbers', () => {
    expect(parseCurrency('1234.56')).toBe(1234.56);
    expect(parseCurrency('1000')).toBe(1000);
  });

  it('should handle edge cases', () => {
    expect(parseCurrency('')).toBe(0);
    expect(parseCurrency(null as any)).toBe(0);
    expect(parseCurrency(undefined as any)).toBe(0);
    expect(parseCurrency('invalid')).toBe(0);
  });

  it('should handle negative values', () => {
    expect(parseCurrency('-$100.50')).toBe(-100.50);
    expect(parseCurrency('$-100.50')).toBe(-100.50);
  });
});
