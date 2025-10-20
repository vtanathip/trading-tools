# Research: Crypto DCA Simulator

**Feature**: 001-crypto-dca-simulator  
**Date**: 2025-10-20  
**Phase**: 0 (Outline & Research)

## Research Questions

### 1. Chart Library Selection

**Decision**: Chart.js 4.x

**Rationale**:
- **Feature Match**: Supports all required features:
  - Line graphs with multiple datasets (up to 5 assets)
  - Interactive tooltips on hover
  - Responsive design (mobile down to 375px)
  - Data point markers
  - Legend with color coding
  - Adaptive performance for large datasets
- **Simplicity**: Simplest API among alternatives (declarative configuration)
- **Size**: ~60KB gzipped - lightweight for browser deployment
- **No Dependencies**: Standalone library
- **Documentation**: Excellent docs with React integration examples
- **Maintenance**: Active development, 60K+ GitHub stars
- **White Theme Support**: Easy to customize colors for white theme UI

**Alternatives Considered**:
- **D3.js**: More powerful but significantly more complex (1000+ lines for equivalent features); overkill for this use case
- **Recharts**: React-specific but heavier (~150KB); adds unnecessary complexity
- **ApexCharts**: Feature-rich but larger bundle size and more complex API
- **Canvas/SVG from scratch**: Would require 1000+ lines of custom code; violates DRY principle

### 2. Cryptocurrency Price API

**Decision**: CoinGecko API (free tier)

**Rationale**:
- **Free Tier**: 10-50 calls/minute without API key (sufficient for typical usage)
- **Historical Data**: Complete historical price data for major cryptocurrencies
- **Coverage**: Supports BTC, ETH, and 10,000+ other cryptocurrencies
- **Reliability**: 99.9% uptime SLA
- **No Authentication**: Public endpoints don't require API keys
- **Rate Limits**: Reasonable for single-user application
- **Data Format**: Clean JSON responses
- **CORS-Friendly**: Supports browser requests

**Alternatives Considered**:
- **CryptoCompare**: Requires API key (adds setup friction); similar features
- **Coinbase API**: Limited to Coinbase-listed assets; requires authentication
- **Binance API**: Good data but rate limits more strict for free tier
- **CoinMarketCap**: Requires API key; more complex authentication

**API Endpoints to Use**:
- `/coins/{id}/market_chart/range`: Historical price data for date range
- `/coins/list`: List of available cryptocurrencies
- `/simple/price`: Current prices for calculations

### 3. Browser Storage Strategy

**Decision**: LocalStorage with 24-hour TTL (Time To Live)

**Rationale**:
- **Capacity**: 5-10MB typical limit sufficient for price data (5 years × 5 assets ≈ 2MB)
- **Persistence**: Survives browser restarts (better UX than SessionStorage)
- **Availability**: Synchronous API (simpler than IndexedDB)
- **Offline Support**: Enables offline functionality after initial load
- **TTL Strategy**: 24-hour expiration balances freshness with API usage

**Storage Schema**:

```javascript
{
  "priceCache": {
    "BTC-USD-2024-01-01-2024-12-31": {
      "data": [...],
      "timestamp": 1729449600000,
      "expiresAt": 1729536000000
    }
  },
  "lastFetch": {
    "BTC-USD": 1729449600000
  }
}
```

**Alternatives Considered**:
- **IndexedDB**: More complex async API; unnecessary for this data size
- **SessionStorage**: Lost on browser close; poor UX for repeated visits
- **In-Memory Only**: Requires re-fetch on every page load; excessive API calls

### 4. Date Handling for Missing Data

**Decision**: Next-available-date purchase strategy (from clarification session)

**Rationale**:
- **Real-World Accuracy**: Mirrors actual trading where you can't buy if exchange is down
- **Data Integrity**: No interpolation errors
- **Simple Logic**: Straightforward to implement and test
- **User Transparency**: Can show which dates had purchases vs skipped

**Implementation Approach**:

```javascript
function findNextAvailableDate(targetDate, priceData) {
  let searchDate = targetDate;
  while (!priceData[searchDate] && searchDate <= today) {
    searchDate = addDays(searchDate, 1);
  }
  return priceData[searchDate] ? searchDate : null;
}
```

### 5. Graph Granularity Strategy

**Decision**: Adaptive granularity based on time range (from clarification session)

**Rationale**:
- **Performance**: Prevents rendering 1000+ data points (browser performance)
- **Readability**: Appropriate detail level for each time scale
- **User Experience**: Matches financial charting conventions

**Granularity Rules**:
- **< 90 days**: Daily view (show all DCA purchases)
- **90-365 days**: Weekly aggregation (group purchases by week)
- **> 1 year**: Monthly aggregation (group purchases by month)

**Implementation**: Use Chart.js time scale with adaptive unit:

```javascript
const timeUnit = days < 90 ? 'day' : days < 365 ? 'week' : 'month';
```

### 6. React Usage Strategy

**Decision**: Minimal React - prefer vanilla JS for static components

**Rationale**:
- **Constitution Compliance**: Aligns with Principle IV (Simplicity)
- **Performance**: Reduce re-renders by using vanilla JS where state doesn't change
- **Learning Curve**: Easier for contributors familiar with vanilla JS

**Use React For**:
- Form state management (SimulatorForm)
- Dynamic chart updates (ChartDisplay)
- Multi-asset comparison UI (AssetComparison)

**Use Vanilla JS For**:
- Static UI elements (headers, footers)
- Formatters and utilities
- Cache management
- API clients

### 7. Testing Strategy

**Decision**: Jest (unit) + Playwright (integration)

**Rationale**:
- **Jest**: Industry standard for JavaScript unit testing; fast, built-in React support
- **Playwright**: Modern, reliable cross-browser testing; better than Selenium
- **Coverage Tools**: Jest has built-in coverage reporting
- **CI/CD Ready**: Both integrate easily with GitHub Actions

**Test Coverage Targets**:
- **100% Critical**: DCA calculation logic (dcaCalculator.js)
- **100% Critical**: Cache management (cacheManager.js)
- **80% General**: All other services and utilities
- **Key Scenarios**: All acceptance scenarios from spec.md

### 8. Azure Blob Storage Deployment

**Decision**: Static website hosting via Azure Storage Account

**Rationale**:
- **Cost**: ~$0.02/GB/month (extremely cheap for static site)
- **Performance**: Built-in CDN support
- **Simplicity**: No server management required
- **HTTPS**: Automatic HTTPS support
- **Custom Domain**: Supports custom domain mapping

**Deployment Process**:

1. Create Azure Storage Account
2. Enable static website hosting
3. Build React app (`npm run build`)
4. Upload `build/` contents to `$web` container
5. Configure custom domain (optional)

**Build Configuration**:
- Set `homepage` in package.json to Azure blob URL
- Configure CORS for API calls
- Enable gzip compression
- Set cache headers for static assets

### 9. URL Sharing Strategy

**Decision**: Query parameter encoding (from clarification session)

**Rationale**:
- **Simple**: Standard URL encoding
- **Portable**: Works with all browsers
- **Readable**: Humans can understand shared URLs
- **Size**: Compact enough for messaging apps

**URL Format**:

```
https://example.com/?asset=BTC-USD&start=2024-01-01&amount=100&freq=weekly
```

**Parameters**:
- `asset`: Crypto pair (e.g., BTC-USD)
- `start`: Start date (ISO 8601)
- `amount`: Investment amount
- `freq`: Frequency (daily|weekly|biweekly|monthly)

**Multi-Asset Support**:

```
?assets=BTC-USD,ETH-USD,BTC-EUR&start=2024-01-01&amount=100&freq=weekly
```

### 10. White Theme UI Design

**Decision**: Minimal white theme with subtle accents

**Rationale**:
- **Simplicity**: Clean, professional appearance
- **Accessibility**: High contrast for readability
- **Focus**: Emphasizes data visualization (charts)
- **Modern**: Follows current web design trends

**Color Palette**:
- **Background**: #FFFFFF (white)
- **Text**: #1a1a1a (near black)
- **Borders**: #e0e0e0 (light gray)
- **Primary**: #2563eb (blue)
- **Success**: #059669 (green - profit)
- **Error**: #dc2626 (red - loss)
- **Chart Colors**: Distinct colors for multi-asset comparison

**Typography**:
- **Font**: System font stack (no custom fonts)
- **Sizes**: 16px base, 14px small, 20px headings
- **Weights**: 400 regular, 600 semibold

## Implementation Best Practices

### Code Quality (Principle I)

- Use ESLint + Prettier for code formatting
- Clear naming: `calculateDCAPortfolioValue()` not `calc()`
- Single responsibility: Each function does one thing
- No magic numbers: Use named constants

```javascript
const CACHE_EXPIRY_HOURS = 24;
const MAX_ASSETS = 5;
const MIN_INVESTMENT = 1;
```

### Testing Standards (Principle II)

- Write tests first (TDD)
- Test file naming: `fileName.test.js`
- Use Given-When-Then format in test descriptions

```javascript
test('Given valid date range, When calculating DCA, Then returns correct portfolio value', () => {
  // Test implementation
});
```

### UX Consistency (Principle III)

- Show loading spinners during API calls
- Display clear error messages with recovery actions
- Provide immediate feedback on all actions
- Mobile-first responsive design

### Simplicity (Principle IV)

- Prefer built-in browser APIs over libraries
- Use native `fetch()` instead of axios
- Use native date handling where possible
- Avoid premature optimization

## Risk Mitigation

### API Rate Limits

- **Risk**: CoinGecko rate limits could block users
- **Mitigation**: 24-hour cache reduces API calls by 95%
- **Fallback**: Show cached data with staleness warning

### Browser Storage Limits

- **Risk**: LocalStorage could fill up (5-10MB)
- **Mitigation**: Implement LRU (Least Recently Used) cache eviction
- **Monitoring**: Track storage usage, warn at 80% capacity

### Calculation Accuracy

- **Risk**: Floating point errors in financial calculations
- **Mitigation**: Use integer math (cents instead of dollars) where possible
- **Testing**: 100% test coverage on DCA calculator

### Offline Functionality

- **Risk**: App breaks without internet
- **Mitigation**: Service worker for offline support (optional)
- **Fallback**: Clear messaging about cached vs fresh data

## Next Steps

Proceed to Phase 1:
1. Create data-model.md (entities and relationships)
2. Generate contracts/ (API interface definitions)
3. Create quickstart.md (usage examples)
4. Update agent context
