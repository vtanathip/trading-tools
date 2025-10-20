# Crypto DCA Simulator

Browser-based Dollar-Cost Averaging simulator for cryptocurrency trading pairs. Visualize historical DCA performance without authentication or server storage.

## Features

- **Basic DCA Simulation**: Calculate historical DCA performance for cryptocurrency pairs
- **Multi-Asset Comparison**: Compare up to 5 different assets simultaneously
- **Interactive Graphs**: Visualize investment value over time with Chart.js
- **Parameter Adjustment**: Experiment with different DCA strategies in real-time
- **URL Sharing**: Share simulations via URL parameters
- **Offline Support**: Works without internet after initial data load
- **Mobile Responsive**: Optimized for screens down to 375px width

## Tech Stack

- **React 18.x**: Minimal UI framework usage
- **Chart.js 4.x**: Lightweight charting library
- **Vite**: Fast build tool and dev server
- **LocalStorage**: Client-side caching (no backend)
- **CoinGecko API**: Free cryptocurrency price data

## Project Structure

```
crypto-dca-simulator/
├── public/
│   ├── index.html          # Entry point
│   └── favicon.ico         # Site icon
├── src/
│   ├── components/         # React components
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   ├── styles/             # CSS files
│   ├── App.js              # Main application
│   └── index.js            # React entry point
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── contract/           # API contract tests
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Installation

```bash
# Clone the repository
cd trading-tools/crypto-dca-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm test:integration` - Run Playwright integration tests
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier

## Usage

1. **Select Asset Pair**: Choose cryptocurrency pair (BTC/USD, ETH/USD, etc.)
2. **Set Start Date**: Pick when DCA strategy begins
3. **Enter Amount**: Specify investment amount per interval
4. **Choose Frequency**: Select DCA frequency (daily, weekly, biweekly, monthly)
5. **Run Simulation**: View results with profit/loss graph and metrics
6. **Compare Assets**: Add up to 4 more assets to compare performance
7. **Adjust Parameters**: Modify settings to experiment with different strategies
8. **Share Results**: Generate URL to share simulation configuration

## Testing

### Unit Tests

```bash
npm test
```

**Coverage Requirements**:
- General code: 80% minimum
- DCA Calculator: 100% (critical logic)

### Integration Tests

```bash
npm run test:integration
```

Tests complete user flows across multiple browsers and devices.

## Deployment

### Azure Blob Storage (Static Site)

```bash
# Build production bundle
npm run build

# Upload to Azure Blob Storage
az storage blob upload-batch \
  --account-name <storage-account> \
  --source build/ \
  --destination '$web'
```

## Architecture

### Client-Side Only

- No backend or database required
- All calculations performed in browser
- Price data cached in LocalStorage (24-hour TTL)
- No user authentication or data persistence

### Performance Goals

- Simulation setup: <30 seconds
- Results display: <3 seconds (up to 5 years data)
- Graph rendering: <1 second
- Smooth interactions (no janky UI)

## Constitution Compliance

This project follows the **Trading Tools Constitution**:

- ✅ **Code Quality**: ESLint enforced, code reviews required
- ✅ **Testing Standards**: Test-first development, 80%+ coverage
- ✅ **UX Consistency**: White theme, clear errors, mobile-responsive
- ✅ **Simplicity**: Minimal dependencies (React + Chart.js only)

## Contributing

1. Follow test-first development (write tests before implementation)
2. Maintain 80%+ test coverage (100% for critical logic)
3. Run `npm run lint` and `npm run format` before committing
4. Ensure all tests pass: `npm test && npm run test:integration`
5. Update documentation when changing interfaces

## License

MIT

## Acknowledgments

- CoinGecko API for cryptocurrency price data
- Chart.js for visualization library
- React team for UI framework
