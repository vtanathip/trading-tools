# Implementation Plan: Crypto DCA Simulator

**Branch**: `001-crypto-dca-simulator` | **Date**: 2025-10-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-crypto-dca-simulator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a browser-based Dollar-Cost Averaging (DCA) simulator for cryptocurrency trading pairs that allows users to visualize historical DCA performance. Users can select crypto pairs (BTC/USD, ETH/USD, etc.), specify start dates and investment amounts/frequencies, and view profit/loss results on an interactive graph. The application supports comparing up to 5 different assets simultaneously and works entirely client-side using browser cache (no authentication or server storage required). Technical approach: React.js with minimal dependencies, vanilla HTML/CSS/JavaScript where possible, white theme UI with web components, deployable to Azure Blob Storage as a static site, using a lightweight charting library (Chart.js recommended for feature match).

## Technical Context

**Language/Version**: TypeScript 4.x+ (strict mode), React 18.x  
**Primary Dependencies**: 
- React 18.x (UI framework - minimal use, prefer vanilla TypeScript)
- Chart.js 4.x (charting library - matches required features: line graphs, tooltips, responsive, multiple datasets)
- Date picker library (lightweight, e.g., Flatpickr or native input[type="date"])
- Cryptocurrency price API client (fetch API for CoinGecko or CryptoCompare)

**Storage**: Browser LocalStorage (5-10MB capacity) for price data cache  
**Testing**: Jest + React Testing Library for unit tests, Playwright or Cypress for integration tests  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), mobile responsive (375px min width)  
**Project Type**: Single-page web application (static site)  
**Performance Goals**: 
- Simulation setup in <30 seconds
- Results display within 3 seconds for up to 5 years of data
- Graph rendering <1 second
- Smooth interactions (no janky UI)

**Constraints**: 
- No backend/server-side code
- No database
- No user authentication
- Must work offline after initial data load
- Deployable to Azure Blob Storage (static hosting)
- Browser LocalStorage limits (5-10MB typical)
- Public API rate limits (CoinGecko: 10-50 calls/min free tier)

**Scale/Scope**: 
- Single user per browser session
- Up to 5 assets compared simultaneously
- Date ranges up to 5 years historical data
- Estimated 100-500 data points per simulation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Before Implementation**:

- [x] Spec defines acceptance tests (Principle II: Testing Standards) ✅ spec.md includes Given-When-Then scenarios
- [x] Complexity justified if introducing new dependencies (Principle IV: Simplicity) ✅ React + Chart.js justified in Complexity Tracking section
- [x] UX patterns consistent with existing tools (Principle III: User Experience Consistency) ✅ White theme, clear error messages, mobile-responsive design specified

**During Implementation**:

- [ ] Tests written first and fail before implementation (Principle II: Testing Standards)
- [ ] Code reviews verify readability and single responsibility (Principle I: Code Quality)

**Before Merge**:

- [ ] All automated tests pass (Principle II: Testing Standards)
- [ ] Code coverage meets minimum thresholds (80% general, 100% critical) (Principle II: Testing Standards)
- [ ] Documentation updated if interfaces changed (Documentation Standards)

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
crypto-dca-simulator/
├── public/
│   ├── index.html           # Entry point
│   └── favicon.ico
├── src/
│   ├── components/          # React components (minimal use)
│   │   ├── SimulatorForm.js    # Input form for DCA parameters
│   │   ├── ChartDisplay.js     # Chart.js wrapper component
│   │   ├── ResultsSummary.js   # Metrics display
│   │   └── AssetComparison.js  # Multi-asset comparison UI
│   ├── services/            # Business logic
│   │   ├── priceApi.js         # CoinGecko/CryptoCompare API client
│   │   ├── dcaCalculator.js    # DCA calculation engine
│   │   ├── cacheManager.js     # LocalStorage management
│   │   └── urlSerializer.js    # Share URL generation/parsing
│   ├── utils/               # Helper functions
│   │   ├── dateHelpers.js      # Date manipulation utilities
│   │   ├── formatters.js       # Number/currency formatters
│   │   └── validators.js       # Input validation
│   ├── styles/              # CSS (vanilla CSS, no preprocessor)
│   │   ├── main.css            # Global styles
│   │   ├── simulator.css       # Simulator-specific styles
│   │   └── chart.css           # Chart customization
│   ├── App.js               # Main application component
│   └── index.js             # Application entry point
├── tests/
│   ├── unit/                # Unit tests (Jest)
│   │   ├── dcaCalculator.test.js
│   │   ├── cacheManager.test.js
│   │   ├── dateHelpers.test.js
│   │   └── validators.test.js
│   ├── integration/         # Integration tests (Playwright/Cypress)
│   │   ├── simulation.test.js
│   │   ├── comparison.test.js
│   │   └── sharing.test.js
│   └── contract/            # API contract tests
│       └── priceApi.test.js
├── package.json
├── .gitignore
├── README.md
└── azure-deploy.json        # Azure Blob Storage config (optional)
```

**Structure Decision**: Single-page web application structure. Follows React best practices with clear separation of concerns: components (UI), services (business logic), and utils (helpers). Tests organized by type (unit/integration/contract). No backend directory needed as this is a pure frontend application deployable to static hosting.

## Complexity Tracking

### Dependency Justification

| Dependency | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| React 18.x | State management for dynamic UI updates (parameter changes, multi-asset comparison) | Vanilla JS state management would require significant boilerplate code for reactive updates; React provides minimal overhead for this use case |
| Chart.js 4.x | Professional-grade charting with tooltips, responsive design, multi-dataset support | Canvas/SVG from scratch would require 1000+ lines of code; D3.js is more complex than needed; Chart.js matches all required features with simplest API |

**Constitution Compliance Note**: While React adds a dependency, it's justified under Principle IV (Simplicity) because:

1. The alternative (vanilla JS state management) would add more complexity in custom code
2. React is industry-standard with excellent documentation
3. We're using it minimally - only for reactive UI, not full framework features
4. Chart.js is the simplest charting library that meets all requirements
5. Total dependencies: 2 core libraries (React + Chart.js) + testing tools

This keeps the application simple while avoiding reinventing well-solved problems.

