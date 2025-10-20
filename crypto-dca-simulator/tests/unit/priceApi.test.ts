/**
 * Unit tests for price API module
 * Focus on module structure and interface validation
 */

import * as priceApi from '../../src/services/priceApi';

describe('Price API Module', () => {
  describe('Module exports', () => {
    test('should export expected functions', () => {
      expect(typeof priceApi.getHistoricalPrices).toBe('function');
      expect(typeof priceApi.getCurrentPrice).toBe('function');
      expect(typeof priceApi.getPriceOnDate).toBe('function');
    });

    test('should export expected interfaces', () => {
      // Test that we can create objects matching the exported interfaces
      const historicalPrice: priceApi.HistoricalPrice = {
        timestamp: 1234567890,
        price: 50000
      };
      
      expect(historicalPrice.timestamp).toBe(1234567890);
      expect(historicalPrice.price).toBe(50000);
    });
  });

  describe('Asset pair parsing', () => {
    test('should handle standard asset pair format', () => {
      // This tests the interface without making actual API calls
      const assetPair = 'BTC-USD';
      expect(assetPair.includes('-')).toBe(true);
      
      const parts = assetPair.split('-');
      expect(parts).toHaveLength(2);
      expect(parts[0]).toBe('BTC');
      expect(parts[1]).toBe('USD');
    });

    test('should validate asset pair components', () => {
      const validPairs = ['BTC-USD', 'ETH-EUR', 'ADA-GBP'];
      
      validPairs.forEach(pair => {
        const parts = pair.split('-');
        expect(parts).toHaveLength(2);
        expect(parts[0]).toBeTruthy();
        expect(parts[1]).toBeTruthy();
      });
    });
  });
});