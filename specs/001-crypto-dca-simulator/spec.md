# Feature Specification: Crypto DCA Simulator

**Feature Branch**: `001-crypto-dca-simulator`  
**Created**: 2025-10-20  
**Status**: Draft  
**Input**: User description: "Build an application that can help provide DCA simulator for cryptocurrency pairs by chosen specific date, DCA simulator can generate a graph that show profit or loss of DCA n times, application can add other assets to compare price trend on graph, No need for authentication since it's public application, No need for database storage since it will use browser cache only not collect any user data persistence, keep it simple and no fancy features"

## Clarifications

### Session 2025-10-20

- Q: When historical price data is missing for specific dates, how should the system handle DCA purchases? → A: Attempt purchase on the next available date with historical data
- Q: How long should cached price data remain valid before requiring a refresh? → A: Expire after 24 hours (daily refresh)
- Q: When the external cryptocurrency price API rate limit is reached, how should the application respond? → A: Use cached data if available and show warning about staleness
- Q: What level of detail should the graph show for different time ranges? → A: Adapt granularity: daily view for <90 days, weekly for 90-365 days, monthly for >1 year
- Q: Which parameters should be included in shared simulation links? → A: Asset pair, start date, amount, and frequency (complete simulation config)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic DCA Simulation (Priority: P1)

A trader wants to understand what would have happened if they had started dollar-cost averaging into Bitcoin or Ethereum at a specific date in the past. They select a cryptocurrency pair, choose a start date, specify how much they would invest per interval (e.g., $100 weekly), and see the results displayed as a graph showing their total investment, current value, and profit/loss over time.

**Why this priority**: This is the core value proposition of the application. Without this, the application has no purpose. This delivers immediate value by showing users the historical performance of their hypothetical DCA strategy.

**Independent Test**: Can be fully tested by selecting a crypto pair (e.g., BTC/USD), entering a start date (e.g., January 1, 2024), specifying investment amount and frequency, and verifying the graph displays correct calculations.

**Acceptance Scenarios**:

1. **Given** the user is on the simulator page, **When** they select BTC/USD pair, enter start date "2024-01-01", amount "$100", and frequency "weekly", **Then** the graph displays weekly investment points showing total invested vs current value
2. **Given** the user has run a simulation, **When** they view the results, **Then** they see total amount invested, current portfolio value, profit/loss amount, and profit/loss percentage
3. **Given** the user selects a date range spanning 1 year, **When** they run the simulation, **Then** the graph displays all DCA purchase points chronologically
4. **Given** the user enters a future date, **When** they attempt to run simulation, **Then** the system shows an error message "Cannot simulate future dates"

---

### User Story 2 - Multiple Asset Comparison (Priority: P2)

A trader wants to compare the DCA performance of different cryptocurrencies over the same time period to understand which would have been more profitable. They run a simulation for Bitcoin, then add Ethereum to the same graph to see both trends simultaneously.

**Why this priority**: This adds significant analytical value by allowing users to compare different investment choices. It builds upon the basic simulation (P1) and helps users make more informed decisions.

**Independent Test**: Can be tested by first running a BTC simulation, then clicking "Add Asset" to overlay ETH on the same graph with matching parameters (same start date, amount, frequency).

**Acceptance Scenarios**:

1. **Given** the user has completed a BTC simulation, **When** they click "Add Asset" and select ETH, **Then** both BTC and ETH trend lines appear on the same graph with distinct colors
2. **Given** multiple assets are displayed, **When** the user views the summary, **Then** each asset shows its own profit/loss metrics side-by-side
3. **Given** the user has 3 assets displayed, **When** they remove one asset, **Then** the graph updates to show only the remaining 2 assets
4. **Given** the user adds an asset with different available historical data, **When** the simulation runs, **Then** each asset displays data only for dates where historical prices are available

---

### User Story 3 - Adjust Simulation Parameters (Priority: P3)

A trader wants to experiment with different DCA strategies by adjusting the investment amount and frequency to see how results would differ. They modify parameters and instantly see updated results without starting over.

**Why this priority**: This enhances user experience by allowing quick experimentation. Users can answer "what if" questions without repeatedly entering all parameters from scratch.

**Independent Test**: Can be tested by running an initial simulation, then changing the amount from $100 to $200, and verifying the graph updates with new calculations.

**Acceptance Scenarios**:

1. **Given** the user has an active simulation, **When** they change investment amount from $100 to $200, **Then** the graph recalculates and updates immediately
2. **Given** the user has weekly DCA selected, **When** they change frequency to "monthly", **Then** the graph shows fewer but larger purchase points
3. **Given** the user adjusts the start date, **When** they move it forward by 6 months, **Then** the simulation recalculates from the new start date
4. **Given** the user has made multiple parameter changes, **When** they click "Reset", **Then** all parameters return to initial values

---

### Edge Cases

- What happens when selected start date has no historical price data available?
- When historical price data is missing for specific DCA purchase dates, the system attempts purchase on the next available date with historical data (maintains purchase order but shifts timing)
- System handles large date ranges by adapting graph granularity (daily for <90 days, weekly for 90-365 days, monthly for >1 year) to maintain readability and performance
- How does system handle extremely large investment amounts that might cause number overflow?
- When external price data source is unavailable or API rate limit is reached, system falls back to cached data and displays staleness warning
- How does system behave when browser cache is full or unavailable?
- What happens when user has no internet connection after initial load?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to select from major cryptocurrency trading pairs (BTC/USD, ETH/USD, BTC/EUR, ETH/EUR minimum)
- **FR-002**: System MUST allow users to specify a start date for DCA simulation using a date picker
- **FR-003**: System MUST allow users to input investment amount per DCA interval (minimum $1, maximum $1,000,000)
- **FR-004**: System MUST support multiple DCA frequencies: daily, weekly, bi-weekly, monthly
- **FR-005**: System MUST fetch historical cryptocurrency price data from a public API for calculation
- **FR-006**: System MUST calculate total amount invested based on number of intervals from start date to present
- **FR-007**: System MUST calculate current portfolio value based on accumulated cryptocurrency holdings at current prices
- **FR-008**: System MUST calculate profit/loss as both absolute amount and percentage
- **FR-009**: System MUST display results as a line graph showing investment value over time
- **FR-009a**: System MUST adapt graph granularity based on time range: daily view for periods less than 90 days, weekly view for 90-365 days (inclusive), monthly view for periods greater than 1 year
- **FR-010**: System MUST show individual DCA purchase points on the graph
- **FR-011**: System MUST allow users to add up to 5 different assets to compare on the same graph
- **FR-012**: System MUST display each asset with a distinct color on the graph
- **FR-013**: System MUST show a summary table with metrics for each asset (total invested, current value, profit/loss)
- **FR-014**: System MUST allow users to remove individual assets from comparison
- **FR-015**: System MUST validate that start date is not in the future
- **FR-016**: System MUST validate that start date is within available historical data range
- **FR-016a**: System MUST handle missing price data by attempting DCA purchase on next available date with historical data
- **FR-017**: System MUST cache simulation results in browser local storage to reduce API calls
- **FR-017a**: System MUST expire cached price data after 24 hours and refresh from API
- **FR-018**: System MUST show loading indicator while fetching price data
- **FR-019**: System MUST display clear error messages when price data cannot be retrieved
- **FR-019a**: System MUST fall back to cached data when API rate limit is reached and display warning about data staleness
- **FR-020**: System MUST work entirely in the browser without requiring user accounts or server-side storage
- **FR-021**: System MUST provide a "Share" feature that generates a URL with simulation parameters (asset pair, start date, amount, frequency)
- **FR-022**: System MUST load simulation parameters from URL query string when shared link is accessed and reproduce the exact simulation configuration
- **FR-023**: System MUST recalculate results when user adjusts any parameter
- **FR-024**: System MUST show tooltip with details when user hovers over graph data points

### Key Entities

- **DCA Simulation**: Represents a single simulation configuration with parameters (asset pair, start date, amount, frequency) and calculated results (total invested, current value, profit/loss)
- **Price Data Point**: Historical price for a specific cryptocurrency at a specific date/time, used for calculating DCA purchases
- **DCA Purchase**: Individual purchase event showing date, price, amount invested, and quantity acquired
- **Asset Comparison**: Collection of multiple DCA simulations displayed together for comparison

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set up and run a basic DCA simulation in under 30 seconds
- **SC-002**: Simulation results display within 3 seconds for date ranges up to 5 years
- **SC-003**: Graph clearly visualizes profit/loss trends without requiring explanation
- **SC-004**: Users can compare up to 5 different assets simultaneously
- **SC-005**: 90% of users can interpret simulation results (profit/loss metrics) without additional help
- **SC-006**: Application functions without internet connection after initial price data is cached
- **SC-007**: Shared simulation links load with exact same parameters and results as original
- **SC-008**: Application works on mobile devices with screen widths down to 375px

## Assumptions

- Historical cryptocurrency price data is available from free public APIs (e.g., CoinGecko, CryptoCompare)
- Price data APIs have reasonable rate limits that allow typical user behavior
- Browser local storage has sufficient capacity for caching price data (typically 5-10MB)
- Users have modern browsers supporting ES6+ JavaScript and local storage
- Cryptocurrency prices are assumed to be in UTC timezone for consistency
- DCA purchases are calculated as if executed at end-of-day closing prices
- For weekly/monthly frequencies, purchases occur on the same day of week/month consistently
- Current portfolio value is calculated using most recent available price data
- No transaction fees or slippage are included in calculations (simplified model)

## Constraints

- No user authentication or account management
- No server-side data storage or persistence
- No database required - all data in browser cache only
- Must work as a static web application
- Limited to public API data only (no premium data sources)
- No real-time price updates (relies on historical data APIs)

## Out of Scope

- User accounts or authentication
- Saving simulations to server
- Real trading or portfolio management
- Tax calculations or reporting
- Transaction fee modeling
- Advanced trading strategies (only DCA)
- Automated trading or buy signals
- Price alerts or notifications
- Mobile native applications (web only)
- Custom cryptocurrency additions by users

