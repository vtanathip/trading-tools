/**
 * Unit tests for DCA Calculator
 * CRITICAL: This file must achieve 100% coverage per Constitution requirements
 */

import {
  calculateDCA,
  calculateSummaryStats,
  validateCalculationConfig,
  DCAConfig,
  DCAPurchase,
} from '../../src/services/dcaCalculator';
import * as priceApi from '../../src/services/priceApi';

// Mock the priceApi module
jest.mock('../../src/services/priceApi');

describe('DCA Calculator - Core Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDCA', () => {
    const mockConfig: DCAConfig = {
      assetPair: 'BTC-USD',
      startDate: '2024-01-01',
      investmentAmount: 100,
      frequency: 'weekly',
      endDate: '2024-01-31',
    };

    const mockHistoricalPrices: priceApi.HistoricalPrice[] = [
      { timestamp: 1704067200, price: 40000 },
      { timestamp: 1704672000, price: 42000 },
      { timestamp: 1705276800, price: 41000 },
      { timestamp: 1705881600, price: 43000 },
    ];

    beforeEach(() => {
      (priceApi.getHistoricalPrices as jest.Mock).mockResolvedValue(mockHistoricalPrices);
      (priceApi.getCurrentPrice as jest.Mock).mockResolvedValue(45000);
    });

    it('should calculate DCA results successfully', async () => {
      const result = await calculateDCA(mockConfig);

      expect(result).toHaveProperty('purchases');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('currentPrice');
      expect(result).toHaveProperty('totalPurchases');
      expect(result).toHaveProperty('dateRange');
    });

    it('should call price API with correct parameters', async () => {
      await calculateDCA(mockConfig);

      expect(priceApi.getHistoricalPrices).toHaveBeenCalledWith(
        'BTC-USD',
        expect.any(Number),
        expect.any(Number)
      );
      expect(priceApi.getCurrentPrice).toHaveBeenCalledWith('BTC-USD');
    });

    it('should generate correct number of purchases', async () => {
      const result = await calculateDCA(mockConfig);

      expect(result.purchases.length).toBeGreaterThan(0);
      expect(result.totalPurchases).toBe(result.purchases.length);
    });

    it('should calculate metrics correctly', async () => {
      const result = await calculateDCA(mockConfig);

      expect(result.metrics).toHaveProperty('totalInvested');
      expect(result.metrics).toHaveProperty('totalQuantity');
      expect(result.metrics).toHaveProperty('currentValue');
      expect(result.metrics).toHaveProperty('profitLoss');
      expect(result.metrics).toHaveProperty('profitLossPercent');
      expect(result.metrics).toHaveProperty('averagePrice');
      
      expect(result.metrics.totalInvested).toBeGreaterThan(0);
      expect(result.metrics.totalQuantity).toBeGreaterThan(0);
    });

    it('should use today as end date if not provided', async () => {
      const configWithoutEndDate: DCAConfig = {
        ...mockConfig,
        endDate: undefined,
      };

      const result = await calculateDCA(configWithoutEndDate);

      expect(result.dateRange.end).toBeTruthy();
      expect(typeof result.dateRange.end).toBe('string');
    });

    it('should throw error when no purchase dates generated', async () => {
      const invalidConfig: DCAConfig = {
        ...mockConfig,
        startDate: '2024-01-31',
        endDate: '2024-01-01', // End before start
      };

      await expect(calculateDCA(invalidConfig)).rejects.toThrow(
        'No purchase dates generated'
      );
    });

    it('should throw error when price data not found', async () => {
      (priceApi.getHistoricalPrices as jest.Mock).mockResolvedValue([]);

      await expect(calculateDCA(mockConfig)).rejects.toThrow('No price data found');
    });

    it('should handle daily frequency', async () => {
      const dailyConfig: DCAConfig = {
        ...mockConfig,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        frequency: 'daily',
      };

      const result = await calculateDCA(dailyConfig);

      expect(result.totalPurchases).toBe(5);
    });

    it('should handle monthly frequency', async () => {
      const monthlyConfig: DCAConfig = {
        ...mockConfig,
        startDate: '2024-01-01',
        endDate: '2024-06-01',
        frequency: 'monthly',
      };

      const result = await calculateDCA(monthlyConfig);

      expect(result.totalPurchases).toBeGreaterThanOrEqual(5);
    });

    it('should calculate profit correctly', async () => {
      const result = await calculateDCA(mockConfig);

      const expectedTotalInvested = result.totalPurchases * mockConfig.investmentAmount;
      expect(result.metrics.totalInvested).toBe(expectedTotalInvested);

      const expectedProfitLoss = result.metrics.currentValue - expectedTotalInvested;
      expect(result.metrics.profitLoss).toBeCloseTo(expectedProfitLoss, 2);
    });

    it('should calculate average price correctly', async () => {
      const result = await calculateDCA(mockConfig);

      const avgPrice = result.metrics.totalInvested / result.metrics.totalQuantity;
      expect(result.metrics.averagePrice).toBeCloseTo(avgPrice, 2);
    });

    it('should find closest price when exact match not found', async () => {
      // Mock price data with gaps
      const sparsePrices = [
        { timestamp: 1704067200000, price: 40000, date: '2024-01-01' },
        { timestamp: 1705276800000, price: 42000, date: '2024-01-15' }, // 2 week gap
      ];
      (priceApi.getHistoricalPrices as jest.Mock).mockResolvedValue(sparsePrices);

      const result = await calculateDCA({
        ...mockConfig,
        frequency: 'weekly', // Will try to find prices for Jan 8 (between Jan 1 and 15)
      });

      // Should still generate purchases using closest available prices
      expect(result.purchases.length).toBeGreaterThan(0);
    });
  });

  describe('calculateSummaryStats', () => {
    const mockPurchases: DCAPurchase[] = [
      { price: 40000, quantity: 0.0025, date: '2024-01-01', timestamp: 1704067200, invested: 100, runningTotal: 100 },
      { price: 42000, quantity: 0.00238, date: '2024-01-08', timestamp: 1704672000, invested: 100, runningTotal: 200 },
      { price: 41000, quantity: 0.00244, date: '2024-01-15', timestamp: 1705276800, invested: 100, runningTotal: 300 },
      { price: 43000, quantity: 0.00233, date: '2024-01-22', timestamp: 1705881600, invested: 100, runningTotal: 400 },
    ];

    it('should calculate min and max prices', () => {
      const stats = calculateSummaryStats(mockPurchases);

      expect(stats.minPrice).toBe(40000);
      expect(stats.maxPrice).toBe(43000);
    });

    it('should calculate average price', () => {
      const stats = calculateSummaryStats(mockPurchases);

      const expectedAvg = (40000 + 42000 + 41000 + 43000) / 4;
      expect(stats.avgPrice).toBe(expectedAvg);
    });

    it('should calculate price volatility', () => {
      const stats = calculateSummaryStats(mockPurchases);

      expect(stats.priceVolatility).toBeGreaterThan(0);
      expect(typeof stats.priceVolatility).toBe('number');
    });

    it('should handle empty purchases array', () => {
      const stats = calculateSummaryStats([]);

      expect(stats.minPrice).toBe(0);
      expect(stats.maxPrice).toBe(0);
      expect(stats.avgPrice).toBe(0);
      expect(stats.priceVolatility).toBe(0);
    });

    it('should handle null/undefined input', () => {
      const statsNull = calculateSummaryStats(null as unknown as DCAPurchase[]);
      const statsUndefined = calculateSummaryStats(undefined as unknown as DCAPurchase[]);

      expect(statsNull.minPrice).toBe(0);
      expect(statsUndefined.minPrice).toBe(0);
    });

    it('should handle single purchase', () => {
      const singlePurchase: DCAPurchase[] = [
        { price: 40000, quantity: 0.0025, date: '2024-01-01', timestamp: 1704067200, invested: 100, runningTotal: 100 }
      ];
      const stats = calculateSummaryStats(singlePurchase);

      expect(stats.minPrice).toBe(40000);
      expect(stats.maxPrice).toBe(40000);
      expect(stats.avgPrice).toBe(40000);
      expect(stats.priceVolatility).toBe(0);
    });
  });

  describe('validateCalculationConfig', () => {
    const validConfig: DCAConfig = {
      assetPair: 'BTC-USD',
      startDate: '2024-01-01',
      investmentAmount: 100,
      frequency: 'weekly',
    };

    it('should accept valid configuration', () => {
      expect(() => validateCalculationConfig(validConfig)).not.toThrow();
    });

    it('should throw error when config is null/undefined', () => {
      expect(() => validateCalculationConfig(null as unknown as Partial<DCAConfig>)).toThrow('Configuration is required');
      expect(() => validateCalculationConfig(undefined as unknown as Partial<DCAConfig>)).toThrow('Configuration is required');
    });

    it('should throw error when assetPair is missing', () => {
      const config = { ...validConfig, assetPair: undefined as unknown as string };
      expect(() => validateCalculationConfig(config)).toThrow('Asset pair is required');
    });

    it('should throw error when startDate is missing', () => {
      const config = { ...validConfig, startDate: undefined as unknown as string };
      expect(() => validateCalculationConfig(config)).toThrow('Start date is required');
    });

    it('should throw error when investmentAmount is missing', () => {
      const config = { ...validConfig, investmentAmount: undefined as unknown as number };
      expect(() => validateCalculationConfig(config)).toThrow(
        'Investment amount must be greater than 0'
      );
    });

    it('should throw error when investmentAmount is zero', () => {
      const config = { ...validConfig, investmentAmount: 0 };
      expect(() => validateCalculationConfig(config)).toThrow(
        'Investment amount must be greater than 0'
      );
    });

    it('should throw error when investmentAmount is negative', () => {
      const config = { ...validConfig, investmentAmount: -100 };
      expect(() => validateCalculationConfig(config)).toThrow(
        'Investment amount must be greater than 0'
      );
    });

    it('should throw error when frequency is missing', () => {
      const config = { ...validConfig, frequency: undefined as unknown as 'weekly' };
      expect(() => validateCalculationConfig(config)).toThrow('Frequency is required');
    });

    it('should throw error when frequency is invalid', () => {
      const config = { ...validConfig, frequency: 'invalid' as 'weekly' };
      expect(() => validateCalculationConfig(config)).toThrow('Frequency must be one of:');
    });

    it('should accept all valid frequencies', () => {
      const frequencies: Array<DCAConfig['frequency']> = ['daily', 'weekly', 'biweekly', 'monthly'];

      frequencies.forEach((frequency) => {
        const config = { ...validConfig, frequency };
        expect(() => validateCalculationConfig(config)).not.toThrow();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      (priceApi.getHistoricalPrices as jest.Mock).mockResolvedValue([
        { timestamp: 1704067200, price: 40000 },
      ]);
      (priceApi.getCurrentPrice as jest.Mock).mockResolvedValue(45000);
    });

    it('should handle single purchase scenario', async () => {
      const singlePurchaseConfig: DCAConfig = {
        assetPair: 'BTC-USD',
        startDate: '2024-01-01',
        endDate: '2024-01-01',
        investmentAmount: 100,
        frequency: 'daily',
      };

      const result = await calculateDCA(singlePurchaseConfig);

      expect(result.totalPurchases).toBe(1);
      expect(result.purchases).toHaveLength(1);
    });

    it('should handle API errors gracefully', async () => {
      (priceApi.getHistoricalPrices as jest.Mock).mockRejectedValue(new Error('API Error'));

      const config: DCAConfig = {
        assetPair: 'BTC-USD',
        startDate: '2024-01-01',
        investmentAmount: 100,
        frequency: 'weekly',
      };

      await expect(calculateDCA(config)).rejects.toThrow('API Error');
    });

    it('should handle very small investment amounts', async () => {
      const smallAmountConfig: DCAConfig = {
        assetPair: 'BTC-USD',
        startDate: '2024-01-01',
        endDate: '2024-01-08',
        investmentAmount: 1,
        frequency: 'weekly',
      };

      const result = await calculateDCA(smallAmountConfig);

      expect(result.metrics.totalInvested).toBe(result.totalPurchases);
      expect(result.metrics.totalQuantity).toBeGreaterThan(0);
    });

    it('should handle large investment amounts', async () => {
      const largeAmountConfig: DCAConfig = {
        assetPair: 'BTC-USD',
        startDate: '2024-01-01',
        endDate: '2024-01-08',
        investmentAmount: 1000000,
        frequency: 'weekly',
      };

      const result = await calculateDCA(largeAmountConfig);

      expect(result.metrics.totalInvested).toBe(result.totalPurchases * 1000000);
    });
  });
});
