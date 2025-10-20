/**
 * Contract tests for CoinGecko API integration
 * Tests API endpoints match expected contract
 */

import * as priceApi from '../../src/services/priceApi';

// Mock fetch for contract testing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('CoinGecko API Contract Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getHistoricalPrices', () => {
    it('should call market_chart/range endpoint with correct parameters', async () => {
      const mockResponse = {
        prices: [
          [1609459200000, 29000],
          [1609545600000, 30000],
        ],
        market_caps: [],
        total_volumes: [],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const fromTimestamp = 1609459200;
      const toTimestamp = 1609545600;

      await priceApi.getHistoricalPrices('BTC-USD', fromTimestamp, toTimestamp);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/coins/bitcoin/market_chart/range')
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`from=${fromTimestamp}`)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`to=${toTimestamp}`)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('vs_currency=usd')
      );
    });

    it('should return prices in expected format', async () => {
      const mockResponse = {
        prices: [
          [1609459200000, 29000],
          [1609545600000, 30000],
        ],
        market_caps: [],
        total_volumes: [],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await priceApi.getHistoricalPrices('BTC-USD', 1609459200, 1609545600);

      expect(result).toEqual([
        { timestamp: 1609459200, price: 29000 },
        { timestamp: 1609545600, price: 30000 },
      ]);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(
        priceApi.getHistoricalPrices('INVALID-USD', 1609459200, 1609545600)
      ).rejects.toThrow('Failed to fetch historical prices');
    });
  });

  describe('getCurrentPrice', () => {
    it('should call simple/price endpoint with correct parameters', async () => {
      const mockResponse = {
        bitcoin: {
          usd: 50000,
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await priceApi.getCurrentPrice('BTC-USD');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/simple/price')
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('ids=bitcoin')
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('vs_currencies=usd')
      );
    });

    it('should return current price as number', async () => {
      const mockResponse = {
        bitcoin: {
          usd: 50000,
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await priceApi.getCurrentPrice('BTC-USD');

      expect(result).toBe(50000);
      expect(typeof result).toBe('number');
    });
  });

  describe('getCoinsList', () => {
    it('should call coins/list endpoint', async () => {
      const mockResponse = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
      ];

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await priceApi.getCoinsList();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/coins/list')
      );
    });

    it('should return array of coins with required fields', async () => {
      const mockResponse = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
      ];

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await priceApi.getCoinsList();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('symbol');
      expect(result[0]).toHaveProperty('name');
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limit between consecutive calls', async () => {
      const mockResponse = { bitcoin: { usd: 50000 } };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const startTime = Date.now();

      await priceApi.getCurrentPrice('BTC-USD');
      await priceApi.getCurrentPrice('ETH-USD');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 1200ms between calls
      expect(duration).toBeGreaterThanOrEqual(1200);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on rate limit error (429)', async () => {
      // First call returns 429, second call succeeds
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ bitcoin: { usd: 50000 } }),
        } as Response);

      const result = await priceApi.getCurrentPrice('BTC-USD');

      expect(result).toBe(50000);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Asset Pair Mapping', () => {
    it('should correctly map BTC to bitcoin', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bitcoin: { usd: 50000 } }),
      } as Response);

      await priceApi.getCurrentPrice('BTC-USD');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('ids=bitcoin')
      );
    });

    it('should correctly map ETH to ethereum', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ethereum: { usd: 3000 } }),
      } as Response);

      await priceApi.getCurrentPrice('ETH-USD');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('ids=ethereum')
      );
    });

    it('should handle EUR currency', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bitcoin: { eur: 45000 } }),
      } as Response);

      await priceApi.getCurrentPrice('BTC-EUR');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('vs_currencies=eur')
      );
    });
  });

  describe('Caching Integration', () => {
    it('should cache historical prices', async () => {
      const mockResponse = {
        prices: [[1609459200000, 29000]],
        market_caps: [],
        total_volumes: [],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First call
      await priceApi.getHistoricalPrices('BTC-USD', 1609459200, 1609545600);
      
      // Second call should use cache
      await priceApi.getHistoricalPrices('BTC-USD', 1609459200, 1609545600);

      // fetch should only be called once
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
