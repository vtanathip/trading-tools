# Service Contracts: Internal Interfaces

**Feature**: 001-crypto-dca-simulator  
**Date**: 2025-10-20  
**Purpose**: Define interfaces for internal services

## 1. DCA Calculator Service

**Purpose**: Calculate DCA purchases and portfolio metrics.

**Interface**:

```typescript
interface DCACalculatorService {
  /**
   * Calculate complete DCA simulation
   * @param config - Simulation configuration
   * @param priceData - Historical price data
   * @returns Complete simulation results
   */
  calculateSimulation(
    config: SimulationConfig,
    priceData: PriceDataPoint[]
  ): SimulationResults;
  
  /**
   * Calculate portfolio value at specific date
   * @param purchases - Array of DCA purchases
   * @param currentPrice - Price to value against
   * @returns Portfolio value
   */
  calculatePortfolioValue(
    purchases: DCAPurchase[],
    currentPrice: number
  ): number;
  
  /**
   * Generate purchase schedule based on frequency
   * @param startDate - Start date
   * @param endDate - End date (default: today)
   * @param frequency - Purchase frequency
   * @returns Array of scheduled dates
   */
  generatePurchaseSchedule(
    startDate: string,
    endDate: string,
    frequency: DCAFrequency
  ): string[];
}
```

**Example Usage**:

```typescript
const calculator = new DCACalculator();

const results = calculator.calculateSimulation(
  {
    id: '123',
    assetPair: 'BTC-USD',
    startDate: '2024-01-01',
    investmentAmount: 100,
    frequency: 'weekly',
    createdAt: Date.now()
  },
  priceData
);

console.log(`Total Invested: $${results.totalInvested}`);
console.log(`Current Value: $${results.currentValue}`);
console.log(`Profit/Loss: $${results.profitLoss} (${results.profitLossPercent}%)`);
```

## 2. Cache Manager Service

**Purpose**: Manage LocalStorage cache for price data.

**Interface**:

```typescript
interface CacheManagerService {
  /**
   * Get cached price data
   * @param key - Cache key (asset-start-end)
   * @returns Cached data or null
   */
  get(key: string): CacheEntry | null;
  
  /**
   * Store price data in cache
   * @param key - Cache key
   * @param data - Price data points
   * @param metadata - Additional metadata
   */
  set(
    key: string,
    data: PriceDataPoint[],
    metadata: Partial<CacheEntry['metadata']>
  ): void;
  
  /**
   * Check if cache entry is valid (not expired)
   * @param key - Cache key
   * @returns true if valid
   */
  isValid(key: string): boolean;
  
  /**
   * Clear expired cache entries
   * @returns Number of entries cleared
   */
  clearExpired(): number;
  
  /**
   * Get cache statistics
   * @returns Cache stats
   */
  getStats(): {
    totalEntries: number;
    totalSize: number;
    oldestEntry: number;
    newestEntry: number;
  };
  
  /**
   * Evict least recently used entry
   */
  evictLRU(): void;
  
  /**
   * Clear all cache
   */
  clearAll(): void;
}
```

**Example Usage**:

```typescript
const cacheManager = new CacheManager();

// Store data
cacheManager.set(
  'BTC-USD-2024-01-01-2024-12-31',
  priceData,
  { assetPair: 'BTC-USD', startDate: '2024-01-01', endDate: '2024-12-31' }
);

// Retrieve data
const cached = cacheManager.get('BTC-USD-2024-01-01-2024-12-31');

if (cached && cacheManager.isValid(cached.key)) {
  console.log('Using cached data');
} else {
  console.log('Fetching fresh data');
}
```

## 3. Price API Service

**Purpose**: Fetch cryptocurrency price data from external API.

**Interface**:

```typescript
interface PriceAPIService {
  /**
   * Fetch historical price data for date range
   * @param assetPair - Asset pair (e.g., "BTC-USD")
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise of price data points
   */
  fetchHistoricalPrices(
    assetPair: string,
    startDate: string,
    endDate: string
  ): Promise<PriceDataPoint[]>;
  
  /**
   * Fetch current price
   * @param assetPair - Asset pair
   * @returns Promise of current price
   */
  fetchCurrentPrice(assetPair: string): Promise<number>;
  
  /**
   * Get list of available cryptocurrencies
   * @returns Promise of coin list
   */
  getAvailableCoins(): Promise<CoinListItem[]>;
  
  /**
   * Check API health
   * @returns true if API is reachable
   */
  checkHealth(): Promise<boolean>;
}
```

**Example Usage**:

```typescript
const priceAPI = new PriceAPIService();

// Fetch historical data
const prices = await priceAPI.fetchHistoricalPrices(
  'BTC-USD',
  '2024-01-01',
  '2024-12-31'
);

// Get current price
const currentPrice = await priceAPI.fetchCurrentPrice('BTC-USD');

// Get available coins
const coins = await priceAPI.getAvailableCoins();
```

## 4. URL Serializer Service

**Purpose**: Generate and parse shareable URLs.

**Interface**:

```typescript
interface URLSerializerService {
  /**
   * Generate shareable URL from config
   * @param config - Simulation configuration
   * @returns URL string
   */
  serialize(config: SimulationConfig): string;
  
  /**
   * Parse simulation config from URL
   * @param url - URL string or query params
   * @returns Simulation configuration or null
   */
  deserialize(url: string): SimulationConfig | null;
  
  /**
   * Generate shareable URL for comparison
   * @param configs - Array of simulation configs
   * @returns URL string
   */
  serializeComparison(configs: SimulationConfig[]): string;
  
  /**
   * Parse comparison configs from URL
   * @param url - URL string or query params
   * @returns Array of configs or null
   */
  deserializeComparison(url: string): SimulationConfig[] | null;
}
```

**Example Usage**:

```typescript
const urlSerializer = new URLSerializer();

// Generate share URL
const shareURL = urlSerializer.serialize(config);
// "https://example.com/?asset=BTC-USD&start=2024-01-01&amount=100&freq=weekly"

// Parse URL
const parsedConfig = urlSerializer.deserialize(window.location.href);

// Generate comparison URL
const comparisonURL = urlSerializer.serializeComparison([config1, config2]);
// "?assets=BTC-USD,ETH-USD&start=2024-01-01&amount=100&freq=weekly"
```

## 5. Validator Service

**Purpose**: Validate user inputs and data integrity.

**Interface**:

```typescript
interface ValidatorService {
  /**
   * Validate simulation configuration
   * @param config - Configuration to validate
   * @returns Validation result
   */
  validateConfig(config: Partial<SimulationConfig>): ValidationResult;
  
  /**
   * Validate asset pair format
   * @param pair - Asset pair string
   * @returns true if valid
   */
  validateAssetPair(pair: string): boolean;
  
  /**
   * Validate date
   * @param date - ISO date string
   * @returns Validation result
   */
  validateDate(date: string): ValidationResult;
  
  /**
   * Validate investment amount
   * @param amount - Amount to validate
   * @returns Validation result
   */
  validateAmount(amount: number): ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

**Example Usage**:

```typescript
const validator = new Validator();

const result = validator.validateConfig({
  assetPair: 'BTC-USD',
  startDate: '2024-01-01',
  investmentAmount: 100,
  frequency: 'weekly'
});

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

## Component Prop Interfaces

### SimulatorForm Props

```typescript
interface SimulatorFormProps {
  onSubmit: (config: SimulationConfig) => void;
  initialConfig?: Partial<SimulationConfig>;
  disabled?: boolean;
}
```

### ChartDisplay Props

```typescript
interface ChartDisplayProps {
  simulationResults: SimulationResults[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  onDataPointHover?: (purchase: DCAPurchase) => void;
}
```

### ResultsSummary Props

```typescript
interface ResultsSummaryProps {
  results: SimulationResults;
  showDetails?: boolean;
}
```

### AssetComparison Props

```typescript
interface AssetComparisonProps {
  simulations: Map<string, SimulationResults>;
  onAddAsset: () => void;
  onRemoveAsset: (assetPair: string) => void;
  maxAssets?: number;
}
```

## Error Types

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Service Initialization

```typescript
// services/index.ts
export function initializeServices() {
  const cacheManager = new CacheManager();
  const priceAPI = new PriceAPIService();
  const calculator = new DCACalculator();
  const urlSerializer = new URLSerializer();
  const validator = new Validator();
  
  return {
    cacheManager,
    priceAPI,
    calculator,
    urlSerializer,
    validator
  };
}
```
