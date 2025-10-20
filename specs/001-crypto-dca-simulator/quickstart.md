# Quickstart Guide: Crypto DCA Simulator

**Feature**: 001-crypto-dca-simulator  
**Date**: 2025-10-20  
**For**: Developers implementing this feature

## Overview

This quickstart guide provides step-by-step instructions for building the crypto DCA simulator application. Follow these steps in order to ensure compliance with the constitution and design specifications.

## Prerequisites

- Node.js 18+ and npm 9+
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Basic knowledge of React, JavaScript ES6+, and web APIs
- Git for version control

## Project Setup

### 1. Initialize Project

```bash
# Create project directory
mkdir crypto-dca-simulator
cd crypto-dca-simulator

# Initialize npm project
npm init -y

# Install core dependencies
npm install react@18 react-dom@18 chart.js@4

# Install dev dependencies
npm install --save-dev \
  @vitejs/plugin-react \
  vite \
  eslint \
  eslint-plugin-react \
  prettier \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  playwright
```

### 2. Configure Build Tool (Vite)

Create `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    sourcemap: true
  },
  server: {
    port: 3000
  }
});
```

### 3. Configure ESLint and Prettier

Create `.eslintrc.json`:

```json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "env": {
    "browser": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-magic-numbers": ["warn", { "ignore": [0, 1, -1] }],
    "max-lines-per-function": ["warn", { "max": 50 }]
  }
}
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 4. Create Project Structure

```bash
mkdir -p src/components src/services src/utils src/styles tests/unit tests/integration tests/contract public
```

## Implementation Order (Test-First)

Follow this order strictly to maintain constitution compliance (Principle II: Testing Standards).

### Phase 1: Core Services (Week 1)

#### Step 1.1: DCA Calculator (Critical - 100% Coverage Required)

**Test First**:

```javascript
// tests/unit/dcaCalculator.test.js
describe('DCACalculator', () => {
  test('Given valid config and price data, When calculating simulation, Then returns correct portfolio value', () => {
    const config = {
      assetPair: 'BTC-USD',
      startDate: '2024-01-01',
      investmentAmount: 100,
      frequency: 'weekly'
    };
    
    const priceData = [
      { date: '2024-01-01', price: 42000, timestamp: 1704067200000 },
      { date: '2024-01-08', price: 43000, timestamp: 1704672000000 }
    ];
    
    const calculator = new DCACalculator();
    const results = calculator.calculateSimulation(config, priceData);
    
    expect(results.totalInvested).toBe(200);
    expect(results.totalQuantity).toBeCloseTo(0.00470930, 6);
    expect(results.currentValue).toBeCloseTo(202.50, 2);
    expect(results.profitLoss).toBeCloseTo(2.50, 2);
  });
  
  // Add more test cases: edge cases, missing data, etc.
});
```

**Then Implement**:

```javascript
// src/services/dcaCalculator.js
export class DCACalculator {
  calculateSimulation(config, priceData) {
    const schedule = this.generatePurchaseSchedule(
      config.startDate,
      new Date().toISOString().split('T')[0],
      config.frequency
    );
    
    const purchases = [];
    let cumulativeInvested = 0;
    let cumulativeQuantity = 0;
    
    for (const date of schedule) {
      const pricePoint = this.findPriceForDate(date, priceData);
      if (!pricePoint) continue;
      
      const quantityAcquired = config.investmentAmount / pricePoint.price;
      cumulativeInvested += config.investmentAmount;
      cumulativeQuantity += quantityAcquired;
      
      purchases.push({
        date,
        price: pricePoint.price,
        amountInvested: config.investmentAmount,
        quantityAcquired,
        cumulativeInvested,
        cumulativeQuantity,
        portfolioValue: cumulativeQuantity * pricePoint.price,
        profitLoss: (cumulativeQuantity * pricePoint.price) - cumulativeInvested,
        profitLossPercent: ((cumulativeQuantity * pricePoint.price) - cumulativeInvested) / cumulativeInvested * 100
      });
    }
    
    const currentPrice = priceData[priceData.length - 1].price;
    
    return {
      config,
      purchases,
      totalInvested: cumulativeInvested,
      currentValue: cumulativeQuantity * currentPrice,
      totalQuantity: cumulativeQuantity,
      profitLoss: (cumulativeQuantity * currentPrice) - cumulativeInvested,
      profitLossPercent: ((cumulativeQuantity * currentPrice) - cumulativeInvested) / cumulativeInvested * 100,
      averagePrice: cumulativeInvested / cumulativeQuantity,
      currentPrice,
      calculatedAt: Date.now(),
      dataSource: 'CoinGecko',
      firstPurchaseDate: purchases[0]?.date,
      lastPurchaseDate: purchases[purchases.length - 1]?.date,
      totalPurchases: purchases.length
    };
  }
  
  generatePurchaseSchedule(startDate, endDate, frequency) {
    // Implementation here
  }
  
  findPriceForDate(date, priceData) {
    // Next-available-date strategy from clarifications
  }
}
```

**Run Tests**:

```bash
npm test -- dcaCalculator.test.js
```

#### Step 1.2: Cache Manager

Follow same pattern: test first, then implement.

```javascript
// tests/unit/cacheManager.test.js
describe('CacheManager', () => {
  test('Given valid data, When storing in cache, Then retrieves successfully', () => {
    // Test implementation
  });
  
  test('Given expired cache, When checking validity, Then returns false', () => {
    // Test implementation
  });
});
```

#### Step 1.3: Price API Client

```javascript
// tests/contract/priceApi.test.js
describe('PriceAPI Contract', () => {
  test('Given valid asset pair, When fetching historical prices, Then returns price array', async () => {
    // Test implementation
  });
});
```

### Phase 2: UI Components (Week 2)

#### Step 2.1: SimulatorForm Component

**Test First**:

```javascript
// tests/unit/SimulatorForm.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import SimulatorForm from '../../src/components/SimulatorForm';

test('Given user fills form, When submitting, Then calls onSubmit with config', () => {
  const onSubmit = jest.fn();
  render(<SimulatorForm onSubmit={onSubmit} />);
  
  fireEvent.change(screen.getByLabelText('Asset Pair'), { target: { value: 'BTC-USD' } });
  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2024-01-01' } });
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText('Frequency'), { target: { value: 'weekly' } });
  
  fireEvent.click(screen.getByText('Run Simulation'));
  
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    assetPair: 'BTC-USD',
    startDate: '2024-01-01',
    investmentAmount: 100,
    frequency: 'weekly'
  }));
});
```

**Then Implement Component**.

#### Step 2.2: ChartDisplay Component

Follow same pattern: test first, implement, verify.

### Phase 3: Integration (Week 3)

#### Step 3.1: End-to-End Simulation Flow

```javascript
// tests/integration/simulation.test.js
import { test, expect } from '@playwright/test';

test('Complete DCA simulation flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Fill form
  await page.selectOption('[name="assetPair"]', 'BTC-USD');
  await page.fill('[name="startDate"]', '2024-01-01');
  await page.fill('[name="amount"]', '100');
  await page.selectOption('[name="frequency"]', 'weekly');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify results
  await expect(page.locator('.results-summary')).toBeVisible();
  await expect(page.locator('.chart-container')).toBeVisible();
  await expect(page.locator('.total-invested')).toContainText('$');
});
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
```

Output in `build/` directory.

### Run Tests

```bash
# All tests
npm test

# Unit tests only
npm test -- tests/unit

# Integration tests
npm test -- tests/integration

# With coverage
npm test -- --coverage
```

## Deployment to Azure Blob Storage

### 1. Create Azure Storage Account

```bash
az storage account create \
  --name dcasimulator \
  --resource-group trading-tools \
  --location eastus \
  --sku Standard_LRS
```

### 2. Enable Static Website Hosting

```bash
az storage blob service-properties update \
  --account-name dcasimulator \
  --static-website \
  --404-document 404.html \
  --index-document index.html
```

### 3. Build and Deploy

```bash
# Build
npm run build

# Upload to $web container
az storage blob upload-batch \
  --account-name dcasimulator \
  --source build/ \
  --destination '$web'
```

### 4. Get Website URL

```bash
az storage account show \
  --name dcasimulator \
  --query "primaryEndpoints.web" \
  --output tsv
```

## Constitution Checklist

Before proceeding to implementation, verify:

- [ ] **Spec defines acceptance tests** ✅ (spec.md has Given-When-Then scenarios)
- [ ] **Complexity justified** ✅ (React + Chart.js justified in plan.md)
- [ ] **UX patterns consistent** ✅ (white theme, clear errors, mobile-responsive)

During implementation:

- [ ] **Tests written first** (Red-Green-Refactor cycle)
- [ ] **Code reviews verify readability** (ESLint + Prettier configured)

Before merge:

- [ ] **All tests pass** (run `npm test`)
- [ ] **Coverage meets thresholds** (80% general, 100% dcaCalculator)
- [ ] **Documentation updated** (update README with any changes)

## Next Steps

1. Review all planning documents (plan.md, research.md, data-model.md, contracts/)
2. Set up development environment
3. Start with Phase 1: Core Services (test-first approach)
4. Proceed through phases sequentially
5. Deploy to Azure when all tests pass

## Common Pitfalls to Avoid

1. **Don't skip tests** - Constitution requires test-first development
2. **Don't add unnecessary dependencies** - Justify any new library
3. **Don't commit without linting** - Run ESLint before every commit
4. **Don't ignore edge cases** - Test all scenarios from spec.md
5. **Don't optimize prematurely** - Readable code first, fast code second

## Getting Help

- Review constitution: `.specify/memory/constitution.md`
- Check spec: `specs/001-crypto-dca-simulator/spec.md`
- See contracts: `specs/001-crypto-dca-simulator/contracts/`
- Read research: `specs/001-crypto-dca-simulator/research.md`
