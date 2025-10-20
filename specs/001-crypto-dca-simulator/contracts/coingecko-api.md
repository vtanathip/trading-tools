# API Contracts: CoinGecko Integration

**Feature**: 001-crypto-dca-simulator  
**Date**: 2025-10-20  
**API Provider**: CoinGecko (free tier)

## Base URL

```
https://api.coingecko.com/api/v3
```

## Authentication

None required for public endpoints (free tier).

## Rate Limits

- **Free Tier**: 10-50 calls/minute
- **Headers**: None provided by CoinGecko for rate limit status
- **Mitigation**: 24-hour cache + request throttling

## Endpoints

### 1. Get Historical Price Data (Market Chart Range)

**Purpose**: Fetch historical price data for a specific date range.

**Endpoint**: `GET /coins/{id}/market_chart/range`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Coin ID (e.g., "bitcoin", "ethereum") |
| vs_currency | string | Yes | Quote currency (e.g., "usd", "eur") |
| from | number | Yes | Start date (Unix timestamp in seconds) |
| to | number | Yes | End date (Unix timestamp in seconds) |

**Example Request**:

```http
GET /coins/bitcoin/market_chart/range?vs_currency=usd&from=1704067200&to=1735689600
```

**Response Format**:

```json
{
  "prices": [
    [1704067200000, 42150.50],
    [1704153600000, 43200.75],
    ...
  ],
  "market_caps": [...],
  "total_volumes": [...]
}
```

**Response Fields**:

- `prices`: Array of [timestamp, price] tuples
  - timestamp: Unix timestamp in milliseconds
  - price: Price in quote currency
- `market_caps`: Market cap data (not used)
- `total_volumes`: Volume data (not used)

**Error Responses**:

```json
{
  "error": "coin not found"
}
```

**Status Codes**:

- `200`: Success
- `404`: Coin not found
- `429`: Rate limit exceeded
- `500`: Server error

**TypeScript Interface**:

```typescript
interface MarketChartRangeResponse {
  prices: [number, number][];      // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}
```

### 2. Get Current Price (Simple Price)

**Purpose**: Fetch current price for portfolio valuation.

**Endpoint**: `GET /simple/price`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ids | string | Yes | Comma-separated coin IDs (e.g., "bitcoin,ethereum") |
| vs_currencies | string | Yes | Comma-separated currencies (e.g., "usd,eur") |

**Example Request**:

```http
GET /simple/price?ids=bitcoin,ethereum&vs_currencies=usd
```

**Response Format**:

```json
{
  "bitcoin": {
    "usd": 42150.50
  },
  "ethereum": {
    "usd": 2250.30
  }
}
```

**TypeScript Interface**:

```typescript
interface SimplePriceResponse {
  [coinId: string]: {
    [currency: string]: number;
  };
}
```

### 3. List Available Coins

**Purpose**: Get list of supported cryptocurrencies for dropdown.

**Endpoint**: `GET /coins/list`

**Parameters**: None

**Example Request**:

```http
GET /coins/list
```

**Response Format**:

```json
[
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin"
  },
  {
    "id": "ethereum",
    "symbol": "eth",
    "name": "Ethereum"
  },
  ...
]
```

**TypeScript Interface**:

```typescript
interface CoinListItem {
  id: string;       // Coin ID for API calls
  symbol: string;   // Short code (btc, eth)
  name: string;     // Full name
}

type CoinListResponse = CoinListItem[];
```

## Coin ID Mapping

Map user-friendly asset pairs to CoinGecko coin IDs:

| Asset Pair | Coin ID | Symbol |
|------------|---------|--------|
| BTC-USD | bitcoin | btc |
| BTC-EUR | bitcoin | btc |
| ETH-USD | ethereum | eth |
| ETH-EUR | ethereum | eth |
| ADA-USD | cardano | ada |
| SOL-USD | solana | sol |

**Helper Function**:

```typescript
function parseAssetPair(pair: string): { coinId: string; currency: string } {
  const [symbol, currency] = pair.split('-');
  const coinId = SYMBOL_TO_COIN_ID[symbol];
  return { coinId, currency: currency.toLowerCase() };
}
```

## Error Handling

### Rate Limit Exceeded (429)

```typescript
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url);
    
    if (response.status === 429) {
      const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
      await sleep(waitTime);
      continue;
    }
    
    return response;
  }
  
  throw new Error('Rate limit exceeded after retries');
}
```

### Cache Fallback

```typescript
async function getPriceData(config: SimulationConfig): Promise<PriceDataPoint[]> {
  const cached = getCachedData(config);
  
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }
  
  try {
    const fresh = await fetchFromAPI(config);
    setCachedData(config, fresh);
    return fresh;
  } catch (error) {
    if (cached) {
      // Use stale cache as fallback
      console.warn('Using stale cache due to API error:', error);
      return cached.data;
    }
    throw error;
  }
}
```

### Missing Data Handling

```typescript
function processPriceData(
  rawData: MarketChartRangeResponse,
  config: SimulationConfig
): PriceDataPoint[] {
  const points = rawData.prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toISOString().split('T')[0],
    price,
    timestamp
  }));
  
  // Fill gaps using next-available-date strategy
  return fillDataGaps(points, config);
}
```

## Request Batching

To minimize API calls when comparing multiple assets:

```typescript
async function fetchMultipleAssets(
  assets: string[],
  config: Omit<SimulationConfig, 'assetPair'>
): Promise<Map<string, PriceDataPoint[]>> {
  const results = new Map();
  
  // Batch requests with delay to respect rate limits
  for (const asset of assets) {
    const data = await getPriceData({ ...config, assetPair: asset });
    results.set(asset, data);
    
    // Wait 100ms between requests (max 10 req/sec)
    await sleep(100);
  }
  
  return results;
}
```

## Data Transformation

### Convert CoinGecko Response to Internal Format

```typescript
function transformMarketChartData(
  response: MarketChartRangeResponse
): PriceDataPoint[] {
  return response.prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toISOString().split('T')[0],
    price: parseFloat(price.toFixed(2)), // Round to 2 decimals
    timestamp
  }));
}
```

### Filter by Date Range

```typescript
function filterByDateRange(
  data: PriceDataPoint[],
  startDate: string,
  endDate: string
): PriceDataPoint[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return data.filter(point => {
    const time = new Date(point.date).getTime();
    return time >= start && time <= end;
  });
}
```

## Testing Contract

### Mock API Responses

```typescript
// tests/mocks/coingecko.ts
export const mockMarketChartResponse: MarketChartRangeResponse = {
  prices: [
    [1704067200000, 42150.50],
    [1704153600000, 43200.75],
    [1704240000000, 41800.25]
  ],
  market_caps: [],
  total_volumes: []
};

export const mockSimplePriceResponse: SimplePriceResponse = {
  bitcoin: { usd: 42150.50 },
  ethereum: { usd: 2250.30 }
};
```

### Contract Tests

```typescript
// tests/contract/priceApi.test.ts
describe('CoinGecko API Contract', () => {
  test('GET /coins/{id}/market_chart/range returns expected format', async () => {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range' +
      '?vs_currency=usd&from=1704067200&to=1704153600'
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('prices');
    expect(Array.isArray(data.prices)).toBe(true);
    expect(data.prices[0]).toHaveLength(2);
    expect(typeof data.prices[0][0]).toBe('number');
    expect(typeof data.prices[0][1]).toBe('number');
  });
});
```

## Rate Limit Management

### Request Queue

```typescript
class RateLimitedQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private requestsPerMinute = 10;
  private delayMs = 60000 / this.requestsPerMinute;
  
  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.process();
      }
    });
  }
  
  private async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      await request();
      await sleep(this.delayMs);
    }
    
    this.processing = false;
  }
}
```

## Next Steps

1. Create `priceApi.js` service implementing these contracts
2. Create contract tests in `tests/contract/priceApi.test.js`
3. Implement error handling and retry logic
4. Add request queue for rate limit management
