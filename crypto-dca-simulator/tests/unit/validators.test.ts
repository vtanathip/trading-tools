/**
 * Unit tests for validators module
 * Tests input validation logic
 */

import {
  validateAssetPair,
  validateInvestmentAmount,
  validateFrequency,
  validateStartDate,
  validateSimulationConfig,
} from '../../src/utils/validators';

describe('validateAssetPair', () => {
  it('should accept valid asset pairs', () => {
    // Original supported pairs
    expect(validateAssetPair('BTC-USD').valid).toBe(true);
    expect(validateAssetPair('ETH-USD').valid).toBe(true);
    expect(validateAssetPair('BTC-EUR').valid).toBe(true);
    expect(validateAssetPair('ETH-EUR').valid).toBe(true);
    
    // Additional supported pairs
    expect(validateAssetPair('BNB-USD').valid).toBe(true);
    expect(validateAssetPair('ADA-USD').valid).toBe(true);
    expect(validateAssetPair('SOL-USD').valid).toBe(true);
    expect(validateAssetPair('XRP-USD').valid).toBe(true);
    expect(validateAssetPair('DOT-USD').valid).toBe(true);
    expect(validateAssetPair('DOGE-USD').valid).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(validateAssetPair('BTCUSD').valid).toBe(false);
    expect(validateAssetPair('BTC_USD').valid).toBe(false);
    expect(validateAssetPair('BTC/USD').valid).toBe(false);
  });

  it('should reject invalid currencies', () => {
    expect(validateAssetPair('XYZ-USD').valid).toBe(false);
    expect(validateAssetPair('BTC-JPY').valid).toBe(false);
    expect(validateAssetPair('ABC-DEF').valid).toBe(false);
  });

  it('should reject missing input', () => {
    expect(validateAssetPair('').valid).toBe(false);
    expect(validateAssetPair(null as any).valid).toBe(false);
    expect(validateAssetPair(undefined as any).valid).toBe(false);
  });

  it('should provide descriptive error messages', () => {
    const result = validateAssetPair('invalid');
    expect(result.error).toContain('format');
  });
});

describe('validateInvestmentAmount', () => {
  it('should accept valid amounts in range', () => {
    expect(validateInvestmentAmount(1).valid).toBe(true);
    expect(validateInvestmentAmount(100).valid).toBe(true);
    expect(validateInvestmentAmount(1000000).valid).toBe(true);
  });

  it('should reject amounts below minimum', () => {
    expect(validateInvestmentAmount(0).valid).toBe(false);
    expect(validateInvestmentAmount(0.5).valid).toBe(false);
    expect(validateInvestmentAmount(-10).valid).toBe(false);
  });

  it('should reject amounts above maximum', () => {
    expect(validateInvestmentAmount(1000001).valid).toBe(false);
    expect(validateInvestmentAmount(2000000).valid).toBe(false);
  });

  it('should reject non-numeric values', () => {
    expect(validateInvestmentAmount(NaN).valid).toBe(false);
    expect(validateInvestmentAmount(null as any).valid).toBe(false);
    expect(validateInvestmentAmount(undefined as any).valid).toBe(false);
  });

  it('should provide descriptive error messages', () => {
    const resultLow = validateInvestmentAmount(0);
    expect(resultLow.error).toContain('minimum');

    const resultHigh = validateInvestmentAmount(2000000);
    expect(resultHigh.error).toContain('maximum');
  });
});

describe('validateFrequency', () => {
  it('should accept valid frequencies', () => {
    expect(validateFrequency('daily').valid).toBe(true);
    expect(validateFrequency('weekly').valid).toBe(true);
    expect(validateFrequency('biweekly').valid).toBe(true);
    expect(validateFrequency('monthly').valid).toBe(true);
  });

  it('should reject invalid frequencies', () => {
    expect(validateFrequency('yearly').valid).toBe(false);
    expect(validateFrequency('hourly').valid).toBe(false);
    expect(validateFrequency('invalid').valid).toBe(false);
  });

  it('should reject missing input', () => {
    expect(validateFrequency('').valid).toBe(false);
    expect(validateFrequency(null as any).valid).toBe(false);
    expect(validateFrequency(undefined as any).valid).toBe(false);
  });

  it('should provide descriptive error messages', () => {
    const result = validateFrequency('invalid');
    expect(result.error).toContain('daily');
    expect(result.error).toContain('weekly');
    expect(result.error).toContain('biweekly');
    expect(result.error).toContain('monthly');
  });
});

describe('validateStartDate', () => {
  it('should accept valid past dates', () => {
    expect(validateStartDate('2024-01-01').valid).toBe(true);
    expect(validateStartDate('2020-06-15').valid).toBe(true);
    expect(validateStartDate('2015-12-31').valid).toBe(true);
  });

  it('should accept today as valid', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(validateStartDate(today).valid).toBe(true);
  });

  it('should reject future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    expect(validateStartDate(futureDateString).valid).toBe(false);
  });

  it('should reject dates before 2010', () => {
    expect(validateStartDate('2009-12-31').valid).toBe(false);
    expect(validateStartDate('2005-01-01').valid).toBe(false);
  });

  it('should reject invalid date formats', () => {
    expect(validateStartDate('invalid').valid).toBe(false);
    expect(validateStartDate('2024-13-01').valid).toBe(false);
    expect(validateStartDate('2024-01-32').valid).toBe(false);
  });

  it('should reject missing input', () => {
    expect(validateStartDate('').valid).toBe(false);
    expect(validateStartDate(null as any).valid).toBe(false);
    expect(validateStartDate(undefined as any).valid).toBe(false);
  });

  it('should provide descriptive error messages', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    const resultFuture = validateStartDate(futureDateString);
    expect(resultFuture.error).toContain('future');

    const resultOld = validateStartDate('2009-01-01');
    expect(resultOld.error).toContain('2010');
  });
});

describe('validateSimulationConfig', () => {
  const validConfig = {
    assetPair: 'BTC-USD',
    startDate: '2024-01-01',
    investmentAmount: 100,
    frequency: 'weekly' as const,
  };

  it('should validate complete valid config', () => {
    const result = validateSimulationConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should collect all validation errors', () => {
    const invalidConfig = {
      assetPair: 'invalid',
      startDate: '2030-01-01',
      investmentAmount: -10,
      frequency: 'invalid' as any,
    };

    const result = validateSimulationConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.assetPair).toBeDefined();
    expect(result.errors.startDate).toBeDefined();
    expect(result.errors.investmentAmount).toBeDefined();
    expect(result.errors.frequency).toBeDefined();
  });

  it('should handle partial validation failures', () => {
    const partiallyInvalidConfig = {
      ...validConfig,
      investmentAmount: 2000000,
    };

    const result = validateSimulationConfig(partiallyInvalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.investmentAmount).toBeDefined();
    expect(result.errors.assetPair).toBeUndefined();
  });

  it('should handle missing fields', () => {
    const result = validateSimulationConfig({} as any);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });
});
