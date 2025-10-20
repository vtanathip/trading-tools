# Data Model: Crypto DCA Simulator

**Feature**: 001-crypto-dca-simulator  
**Date**: 2025-10-20  
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the data structures and relationships for the DCA simulator. Since this is a client-side only application with no database, these models represent in-memory JavaScript objects and LocalStorage schemas.

## Core Entities

### 1. DCA Simulation Configuration

Represents the user's simulation parameters.

```typescript
interface SimulationConfig {
  id: string;                    // UUID for tracking
  assetPair: string;             // e.g., "BTC-USD", "ETH-EUR"
  startDate: string;             // ISO 8601 date: "2024-01-01"
  investmentAmount: number;      // In base currency (USD/EUR)
  frequency: DCAFrequency;       // daily | weekly | biweekly | monthly
  createdAt: number;             // Timestamp
}

type DCAFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
```

**Validation Rules**:

- `assetPair`: Must match pattern `^[A-Z]{3,5}-[A-Z]{3}$`
- `startDate`: Must be valid ISO 8601 date, not in future, within available historical data range
- `investmentAmount`: Must be number >= 1 and <= 1,000,000
- `frequency`: Must be one of enum values

**State Transitions**: Immutable once created (new simulation = new object)

### 2. Price Data Point

Historical price data for a specific cryptocurrency at a specific date/time.

```typescript
interface PriceDataPoint {
  date: string;                  // ISO 8601 date
  price: number;                 // Price in quote currency (USD/EUR)
  timestamp: number;             // Unix timestamp (ms)
}
```

**Validation Rules**:

- `date`: Must be valid ISO 8601 date
- `price`: Must be number > 0
- `timestamp`: Must be valid Unix timestamp

**Source**: Fetched from CoinGecko API

### 3. DCA Purchase Event

Individual purchase event showing when crypto was "bought" in simulation.

```typescript
interface DCA Purchase {
  date: string;                  // ISO 8601 date of purchase
  price: number;                 // Price per unit at purchase
  amountInvested: number;        // Amount invested this purchase
  quantityAcquired: number;      // Crypto quantity acquired
  cumulativeInvested: number;    // Total invested up to this point
  cumulativeQuantity: number;    // Total quantity acquired up to this point
  portfolioValue: number;        // Current value at this purchase date
  profitLoss: number;            // Cumulative P/L at this purchase date
  profitLossPercent: number;     // Cumulative P/L % at this purchase date
}
```

**Calculated Fields**:

- `quantityAcquired = amountInvested / price`
- `cumulativeInvested = sum(all previous amountInvested)`
- `cumulativeQuantity = sum(all previous quantityAcquired)`
- `portfolioValue = cumulativeQuantity * currentPrice`
- `profitLoss = portfolioValue - cumulativeInvested`
- `profitLossPercent = (profitLoss / cumulativeInvested) * 100`

### 4. Simulation Results

Complete simulation output with all calculations.

```typescript
interface SimulationResults {
  config: SimulationConfig;
  purchases: DCAPurchase[];
  
  // Summary metrics
  totalInvested: number;         // Sum of all investments
  currentValue: number;          // Current portfolio value
  totalQuantity: number;         // Total crypto acquired
  profitLoss: number;            // Total P/L
  profitLossPercent: number;     // Total P/L %
  averagePrice: number;          // Average purchase price
  currentPrice: number;          // Latest price
  
  // Metadata
  calculatedAt: number;          // When calculation was performed
  dataSource: string;            // API source (e.g., "CoinGecko")
  firstPurchaseDate: string;     // Actual first purchase date (may differ if data missing)
  lastPurchaseDate: string;      // Actual last purchase date
  totalPurchases: number;        // Count of purchase events
}
```

### 5. Asset Comparison

Collection of multiple simulations for comparison.

```typescript
interface AssetComparison {
  simulations: Map<string, SimulationResults>;  // Key: assetPair
  baseConfig: Partial<SimulationConfig>;        // Shared config (date, amount, freq)
  comparisonDate: number;                       // When comparison was created
}
```

**Constraints**:

- Maximum 5 simulations per comparison (FR-011)
- All simulations must share same `startDate`, `investmentAmount`, and `frequency`

### 6. Cache Entry

LocalStorage cache structure for price data.

```typescript
interface CacheEntry {
  key: string;                   // Format: "{assetPair}-{startDate}-{endDate}"
  data: PriceDataPoint[];        // Array of price points
  fetchedAt: number;             // When data was fetched
  expiresAt: number;             // When cache expires (fetchedAt + 24h)
  source: string;                // API source
  metadata: {
    assetPair: string;
    startDate: string;
    endDate: string;
    dataPoints: number;          // Count of data points
  };
}
```

**Expiration Rules**:

- TTL: 24 hours (86400000 ms)
- Eviction: LRU when storage > 80% capacity
- Validation: Check `expiresAt` before use

## LocalStorage Schema

### Structure

```javascript
{
  "dca_simulator": {
    "version": "1.0",
    "priceCache": {
      "BTC-USD-2024-01-01-2024-12-31": {
        "data": [...],
        "fetchedAt": 1729449600000,
        "expiresAt": 1729536000000,
        "source": "CoinGecko",
        "metadata": {
          "assetPair": "BTC-USD",
          "startDate": "2024-01-01",
          "endDate": "2024-12-31",
          "dataPoints": 365
        }
      }
    },
    "lastFetch": {
      "BTC-USD": 1729449600000,
      "ETH-USD": 1729449000000
    },
    "settings": {
      "defaultCurrency": "USD",
      "defaultFrequency": "weekly"
    }
  }
}
```

### Storage Limits

- **Total Capacity**: 5-10MB (browser dependent)
- **Target Usage**: < 80% capacity (4-8MB)
- **Per Asset Cache**: ~100KB for 5 years of daily data
- **Maximum Cached Assets**: ~40-80 different asset-date-range combinations

## Relationships

```text
SimulationConfig (1) ──> (N) DCAPurchase
                  │
                  ├──> (1) SimulationResults
                  │
AssetComparison (1) ──> (N) SimulationResults
                  │
PriceDataPoint (N) ──> (1) CacheEntry
```

## Data Flow

### 1. User Initiates Simulation

```
User Input
  └─> SimulationConfig created
       └─> Validate inputs
            └─> Check cache for price data
                 ├─> Cache hit: Use cached data
                 └─> Cache miss: Fetch from API
                      └─> Store in cache
                           └─> Calculate DCA purchases
                                └─> Generate SimulationResults
                                     └─> Render chart
```

### 2. Add Asset for Comparison

```
Existing SimulationResults
  └─> User adds new asset
       └─> Create new SimulationConfig (same params, different asset)
            └─> Follow simulation flow
                 └─> Merge into AssetComparison
                      └─> Update chart with new dataset
```

### 3. Parameter Adjustment

```
User changes parameter
  └─> Update SimulationConfig
       └─> Recalculate DCA purchases (use cached prices)
            └─> Update SimulationResults
                 └─> Update chart (no API call needed)
```

## Validation Rules Summary

| Field | Min | Max | Pattern | Required |
|-------|-----|-----|---------|----------|
| investmentAmount | 1 | 1,000,000 | numeric | Yes |
| startDate | 2010-01-01 | today | ISO 8601 | Yes |
| assetPair | - | - | `[A-Z]{3,5}-[A-Z]{3}` | Yes |
| frequency | - | - | enum | Yes |

## Edge Cases Handling

### Missing Price Data

When price data is missing for scheduled purchase date:

```typescript
function findNextAvailableDate(
  targetDate: string,
  priceData: PriceDataPoint[]
): PriceDataPoint | null {
  let searchDate = new Date(targetDate);
  const today = new Date();
  
  while (searchDate <= today) {
    const found = priceData.find(p => p.date === searchDate.toISOString().split('T')[0]);
    if (found) return found;
    
    searchDate.setDate(searchDate.getDate() + 1);
  }
  
  return null; // No data available
}
```

### Cache Expiration

```typescript
function isCacheValid(entry: CacheEntry): boolean {
  const now = Date.now();
  return now < entry.expiresAt;
}
```

### Storage Full

```typescript
function evictOldestCacheEntry() {
  const entries = Object.entries(cache.priceCache);
  const oldest = entries.reduce((old, [key, entry]) => 
    entry.fetchedAt < old.fetchedAt ? entry : old
  );
  delete cache.priceCache[oldest.key];
}
```

## Performance Considerations

### Data Size Estimates

- **Single DCA Purchase**: ~200 bytes
- **1 year daily DCA**: ~73KB (365 purchases)
- **5 years weekly DCA**: ~27KB (260 purchases)
- **5 assets, 5 years each**: ~135KB

### Optimization Strategies

1. **Lazy Loading**: Fetch price data only when needed
2. **Data Compression**: Consider gzip for large cache entries
3. **Adaptive Granularity**: Reduce data points for long periods (monthly aggregation)
4. **Efficient Calculations**: Cache intermediate results (cumulative sums)

## Next Steps

Proceed to contracts/ directory to define:

1. CoinGecko API interface contracts
2. Internal service interfaces (dcaCalculator, cacheManager)
3. Component prop interfaces
