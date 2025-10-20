/**
 * Unit tests for cache manager
 * Tests cache operations, TTL, and LRU eviction
 */

import * as cache from '../../src/services/cacheManager';

describe('Cache Manager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('test-key', 'test-value');
      const result = cache.get<string>('test-key');
      expect(result).toBe('test-value');
    });

    it('should handle complex objects', () => {
      interface TestData {
        id: number;
        name: string;
        nested: { value: number };
      }

      const testData: TestData = {
        id: 1,
        name: 'Test',
        nested: { value: 42 },
      };

      cache.set('complex-key', testData);
      const result = cache.get<TestData>('complex-key');
      
      expect(result).toEqual(testData);
      expect(result?.nested.value).toBe(42);
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle arrays', () => {
      const testArray = [1, 2, 3, 4, 5];
      cache.set('array-key', testArray);
      const result = cache.get<number[]>('array-key');
      
      expect(result).toEqual(testArray);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entries after TTL', () => {
      const shortTTL = 100; // 100ms
      
      cache.set('expiring-key', 'value', shortTTL);
      expect(cache.get('expiring-key')).toBe('value');
      
      // Wait for TTL to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(cache.get('expiring-key')).toBeNull();
          resolve();
        }, 150);
      });
    });

    it('should not expire entries within TTL', () => {
      const longTTL = 10000; // 10 seconds
      
      cache.set('valid-key', 'value', longTTL);
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(cache.get('valid-key')).toBe('value');
          resolve();
        }, 100);
      });
    });

    it('should use default TTL (24 hours) when not specified', () => {
      cache.set('default-ttl-key', 'value');
      expect(cache.isValid('default-ttl-key')).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true for valid cache entries', () => {
      cache.set('valid-key', 'value');
      expect(cache.isValid('valid-key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.isValid('non-existent')).toBe(false);
    });

    it('should return false for expired entries', () => {
      const shortTTL = 100;
      cache.set('expiring-key', 'value', shortTTL);
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(cache.isValid('expiring-key')).toBe(false);
          resolve();
        }, 150);
      });
    });
  });

  describe('clearExpired', () => {
    it('should remove expired entries', () => {
      const shortTTL = 100;
      
      cache.set('expired-1', 'value1', shortTTL);
      cache.set('expired-2', 'value2', shortTTL);
      cache.set('valid', 'value3', 10000);
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const clearedCount = cache.clearExpired();
          
          expect(clearedCount).toBeGreaterThanOrEqual(2);
          expect(cache.get('expired-1')).toBeNull();
          expect(cache.get('expired-2')).toBeNull();
          expect(cache.get('valid')).toBe('value3');
          resolve();
        }, 150);
      });
    });

    it('should return 0 when no entries are expired', () => {
      cache.set('valid-1', 'value1');
      cache.set('valid-2', 'value2');
      
      const clearedCount = cache.clearExpired();
      expect(clearedCount).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('should remove all cache entries', () => {
      cache.set('key-1', 'value1');
      cache.set('key-2', 'value2');
      cache.set('key-3', 'value3');
      
      const clearedCount = cache.clearAll();
      
      expect(clearedCount).toBe(3);
      expect(cache.get('key-1')).toBeNull();
      expect(cache.get('key-2')).toBeNull();
      expect(cache.get('key-3')).toBeNull();
    });

    it('should not affect non-cache localStorage items', () => {
      // Set a non-cache item
      localStorage.setItem('other-key', 'other-value');
      
      cache.set('cache-key', 'cache-value');
      cache.clearAll();
      
      expect(localStorage.getItem('other-key')).toBe('other-value');
      expect(cache.get('cache-key')).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('key-1', 'value1');
      cache.set('key-2', 'value2');
      
      const stats = cache.getStats();
      
      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('validEntries');
      expect(stats).toHaveProperty('expiredEntries');
      expect(stats).toHaveProperty('totalSizeBytes');
      expect(stats).toHaveProperty('maxSizeBytes');
      expect(stats).toHaveProperty('utilizationPercent');
      
      expect(stats.totalEntries).toBe(2);
      expect(stats.validEntries).toBe(2);
    });

    it('should track expired entries correctly', () => {
      const shortTTL = 100;
      
      cache.set('expired-key', 'value', shortTTL);
      cache.set('valid-key', 'value');
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const stats = cache.getStats();
          
          expect(stats.expiredEntries).toBeGreaterThanOrEqual(1);
          resolve();
        }, 150);
      });
    });
  });

  describe('LRU Eviction', () => {
    it('should handle quota exceeded errors gracefully', () => {
      // Simulate quota exceeded by storing very large data
      const largeData = 'x'.repeat(1000000); // 1MB string
      
      const result = cache.set('large-key', largeData);
      
      // Should either succeed or handle gracefully
      expect(typeof result).toBe('boolean');
    });

    it('should allow new entries after eviction', () => {
      // Fill cache with multiple entries
      for (let i = 0; i < 50; i++) {
        cache.set(`key-${i}`, `value-${i}`);
      }
      
      // Should still be able to add more
      const result = cache.set('new-key', 'new-value');
      expect(result).toBe(true);
      expect(cache.get('new-key')).toBe('new-value');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', () => {
      // Manually set invalid JSON
      localStorage.setItem('crypto-dca-cache:invalid', 'not-json');
      
      const result = cache.get('invalid');
      expect(result).toBeNull();
    });

    it('should handle null values', () => {
      cache.set('null-key', null);
      const result = cache.get('null-key');
      expect(result).toBeNull();
    });

    it('should handle undefined values', () => {
      cache.set('undefined-key', undefined);
      const result = cache.get('undefined-key');
      
      // undefined cannot be serialized to JSON, so the value is lost
      // When retrieved, it will not exist (null) or be undefined
      expect([null, undefined]).toContain(result);
    });
  });

  describe('Cache Key Isolation', () => {
    it('should use prefix to isolate cache keys', () => {
      cache.set('test', 'cache-value');
      
      // Direct localStorage access should see prefixed key
      const directValue = localStorage.getItem('crypto-dca-cache:test');
      expect(directValue).toBeTruthy();
      
      // But cache.get should work without prefix
      expect(cache.get('test')).toBe('cache-value');
    });

    it('should not interfere with other localStorage keys', () => {
      localStorage.setItem('my-app-key', 'my-value');
      cache.set('cache-key', 'cache-value');
      
      expect(localStorage.getItem('my-app-key')).toBe('my-value');
      expect(cache.get('cache-key')).toBe('cache-value');
    });
  });
});
