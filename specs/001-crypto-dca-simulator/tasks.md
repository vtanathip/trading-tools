# Tasks: Crypto DCA Simulator

**Input**: Design documents from `/specs/001-crypto-dca-simulator/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Constitution Principle II requires test-first development. DCA calculator requires 100% coverage. All other code requires 80% minimum coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a single-page web application with structure:

- `crypto-dca-simulator/src/` - Source code
- `crypto-dca-simulator/tests/` - Test files
- `crypto-dca-simulator/public/` - Static assets

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure per implementation plan (crypto-dca-simulator/ with src/, tests/, public/ subdirectories)
- [x] T002 Initialize npm project with package.json and install core dependencies (react@18, react-dom@18, chart.js@4)
- [x] T003 [P] Install dev dependencies in package.json (vite, eslint, prettier, jest, @testing-library/react, playwright, typescript, @types/react, @types/react-dom)
- [x] T003a [P] Create tsconfig.json with strict TypeScript configuration (strict: true, noImplicitAny: true, target: ES2020, module: ESNext)
- [x] T003b [P] Install TypeScript type definitions for Chart.js and other dependencies (@types/chart.js)
- [x] T004 [P] Create Vite configuration file vite.config.ts with React and TypeScript plugin settings
- [x] T005 [P] Configure ESLint in .eslintrc.json with React and TypeScript rules (@typescript-eslint/parser, @typescript-eslint/eslint-plugin)
- [x] T006 [P] Configure Prettier in .prettierrc for consistent formatting
- [x] T007 [P] Configure Jest in jest.config.js for unit testing with React Testing Library
- [x] T008 [P] Configure Playwright in playwright.config.ts for integration testing
- [x] T009 [P] Create .gitignore file excluding node_modules, build, coverage directories
- [x] T010 Create public/index.html entry point with meta tags and root div
- [x] T011 [P] Create public/favicon.ico placeholder
- [x] T012 Create src/index.tsx entry point that renders React app
- [x] T013 [P] Create initial README.md with project description and setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T014 [P] Create src/styles/main.css with global styles, CSS variables for white theme, typography, and layout
- [x] T015 [P] Create src/utils/validators.ts with input validation functions (date range, investment amount, asset pair format)
- [x] T016 [P] Create src/utils/formatters.ts with number/currency formatting utilities
- [x] T017 [P] Create src/utils/dateHelpers.ts with date manipulation and purchase schedule generation functions
- [x] T018 Create src/services/cacheManager.ts with LocalStorage management (get, set, isValid, clearExpired, evictLRU)
- [x] T019 Create src/services/priceApi.ts with CoinGecko API client (getHistoricalPrices, getCurrentPrice, getCoinsList, rate limiting)
- [x] T020 Create tests/contract/priceApi.test.ts with API contract tests for CoinGecko endpoints
- [x] T021 Create tests/unit/validators.test.ts testing all validation rules from data-model.md
- [x] T021a [P] Add future date validation test cases in tests/unit/validators.test.ts for FR-015 compliance (test rejection of future dates)
- [x] T021b [P] Implement future date validation logic in src/utils/validators.ts to check start date is not after current date
- [x] T022 [P] Create tests/unit/formatters.test.ts testing currency and number formatting edge cases
- [x] T023 [P] Create tests/unit/dateHelpers.test.ts testing date calculations and schedule generation
- [x] T024 Create tests/unit/cacheManager.test.ts testing cache operations, TTL, and LRU eviction

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic DCA Simulation (Priority: P1) 🎯 MVP

**Goal**: Users can run a single DCA simulation for one crypto asset, see profit/loss graph and metrics

**Independent Test**: Select BTC/USD, enter start date 2024-01-01, amount $100, frequency weekly → Graph displays with total invested, current value, and profit/loss metrics

### Critical Service for User Story 1 (100% Coverage Required)

- [x] T025 Create tests/unit/dcaCalculator.test.ts with comprehensive test cases (valid inputs, edge cases, missing data, large datasets, boundary conditions) - MUST FAIL initially
- [x] T026 [US1] Create src/services/dcaCalculator.ts implementing DCACalculatorService interface (calculateSimulation, calculatePortfolioValue, generatePurchaseSchedule)

### Components for User Story 1

- [x] T027 [P] [US1] Create tests/unit/SimulatorForm.test.tsx testing form validation and submission
- [x] T028 [P] [US1] Create src/components/SimulatorForm.tsx with input fields (asset pair dropdown, date picker, amount input, frequency selector) and validation
- [x] T029 [P] [US1] Create src/styles/simulator.css with form styles matching white theme
- [x] T030 [US1] Create tests/unit/ChartDisplay.test.tsx testing Chart.js rendering and data display
- [x] T031 [US1] Create src/components/ChartDisplay.tsx wrapping Chart.js with line graph configuration
- [x] T032 [P] [US1] Create src/styles/chart.css with chart customization for white theme
- [x] T033 [P] [US1] Create tests/unit/ResultsSummary.test.tsx testing metrics display and formatting
- [x] T034 [P] [US1] Create src/components/ResultsSummary.tsx displaying total invested, current value, profit/loss, profit/loss percent

### Integration for User Story 1

- [x] T035 [US1] Create src/App.tsx main component integrating SimulatorForm, ChartDisplay, and ResultsSummary with state management
- [x] T036 [US1] Create tests/integration/simulation.test.ts with end-to-end simulation flow test using Playwright
- [x] T037 [US1] Verify all acceptance scenarios from spec.md User Story 1 pass

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - MVP READY

---

## Phase 4: User Story 2 - Multiple Asset Comparison (Priority: P2)

**Goal**: Users can compare DCA performance of up to 5 different cryptocurrencies on same graph

**Independent Test**: Run BTC simulation, click "Add Asset", add ETH with same parameters → Both trend lines appear with distinct colors and separate metrics

### Components for User Story 2

- [x] T038 [P] [US2] Create tests/unit/AssetComparison.test.tsx testing multi-asset state management and display
- [x] T039 [US2] Create src/components/AssetComparison.tsx with asset list, add/remove controls, and multi-asset metrics display
- [x] T040 [US2] Update src/components/ChartDisplay.tsx to support multiple datasets with distinct colors (5 asset maximum)
- [x] T041 [US2] Update src/components/ResultsSummary.tsx to display side-by-side metrics for multiple assets
- [x] T042 [US2] Update src/App.tsx to manage AssetComparison state and coordinate multiple simulations

### Integration for User Story 2

- [ ] T043 [US2] Create tests/integration/comparison.test.ts with end-to-end multi-asset comparison flow
- [ ] T044 [US2] Verify all acceptance scenarios from spec.md User Story 2 pass
- [ ] T045 [US2] Test edge case: adding asset with different historical data availability

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Adjust Simulation Parameters (Priority: P3)

**Goal**: Users can modify simulation parameters and instantly see updated results without starting over

**Independent Test**: Run initial simulation, change amount from $100 to $200 → Graph recalculates and updates immediately

### Implementation for User Story 3

- [ ] T046 [P] [US3] Create tests/unit/parameterAdjustment.test.ts testing parameter change handling and recalculation
- [ ] T047 [US3] Update src/components/SimulatorForm.tsx to support parameter editing after initial simulation
- [ ] T048 [US3] Add reset functionality to src/components/SimulatorForm.tsx to restore initial values
- [ ] T049 [US3] Update src/App.tsx to detect parameter changes and trigger recalculation
- [ ] T050 [US3] Optimize src/services/dcaCalculator.ts to handle rapid recalculations efficiently
- [ ] T051 [US3] Add loading states to src/components/ChartDisplay.tsx for recalculation feedback

### Integration for User Story 3

- [ ] T052 [US3] Create tests/integration/parameterAdjustment.test.ts with end-to-end parameter modification flow
- [ ] T053 [US3] Verify all acceptance scenarios from spec.md User Story 3 pass
- [ ] T054 [US3] Test rapid parameter changes don't cause race conditions or incorrect calculations

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Sharing Functionality (Cross-Story Feature)

**Purpose**: URL sharing feature that spans all user stories (FR-021, FR-022)

- [ ] T055 Create tests/unit/urlSerializer.test.ts testing URL generation and parsing
- [ ] T056 Create src/services/urlSerializer.ts implementing URLSerializerService interface (serialize, deserialize)
- [ ] T057 Add "Share" button to src/components/ResultsSummary.js that generates shareable URL
- [ ] T058 Update src/App.js to parse URL query parameters on load and restore simulation
- [ ] T059 Create tests/integration/sharing.test.js with end-to-end URL sharing flow
- [ ] T060 Verify shared URLs load exact simulation configuration and reproduce results

---

## Phase 7: Enhanced UX & Error Handling

**Purpose**: Polish user experience with loading states, error messages, and edge case handling

- [ ] T061 [P] Add loading spinner component to src/components/LoadingSpinner.js
- [ ] T062 [P] Add error message component to src/components/ErrorMessage.js with user-friendly messages
- [ ] T063 Add loading indicators to src/App.js for API calls and calculations (FR-018)
- [ ] T064 Add error handling to src/services/priceApi.js with fallback to cached data (FR-019a)
- [ ] T065 Add validation error messages to src/components/SimulatorForm.js (FR-019)
- [ ] T066 Add tooltip functionality to src/components/ChartDisplay.js for data point details (FR-024)
- [ ] T067 Implement adaptive graph granularity in src/components/ChartDisplay.js (daily <90d, weekly 90-365d, monthly >1yr) (FR-009a)
- [ ] T068 Add missing data handling to src/services/dcaCalculator.js (next-available-date strategy) (FR-016a)
- [ ] T069 Add future date validation to src/utils/validators.js (FR-015)
- [ ] T070 Add historical data range validation to src/utils/validators.js (FR-016)

---

## Phase 8: Performance & Mobile Optimization

**Purpose**: Ensure performance goals and mobile responsiveness

- [ ] T071 [P] Create src/styles/mobile.css with responsive styles for 375px minimum width
- [ ] T072 Add media queries to src/styles/simulator.css for mobile form layout
- [ ] T073 Test and optimize Chart.js performance for 5 years × 5 assets (target: <1s render)
- [ ] T074 Implement caching strategy optimization in src/services/cacheManager.js for 80% capacity limit
- [ ] T075 Add performance monitoring to track simulation calculation time (target: <3s for 5 years)
- [ ] T076 Test mobile responsiveness on Chrome/Firefox/Safari mobile browsers
- [ ] T077 Verify offline functionality after initial data load (SC-006)

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and quality gates

- [ ] T078 [P] Create comprehensive README.md in crypto-dca-simulator/ with usage instructions
- [ ] T079 [P] Create docs/user-guide.md with screenshots and examples
- [ ] T080 Add JSDoc comments to all services in src/services/
- [ ] T081 Add PropTypes or TypeScript interfaces to all React components
- [ ] T082 Run ESLint on entire codebase and fix violations
- [ ] T083 Run Prettier on entire codebase for consistent formatting
- [ ] T084 Verify test coverage meets requirements (80% general, 100% dcaCalculator)
- [ ] T085 Run all integration tests from tests/integration/
- [ ] T086 Verify all success criteria from spec.md (SC-001 through SC-008)
- [ ] T087 Run quickstart.md validation following setup instructions
- [ ] T088 Create azure-deploy.json configuration for Azure Blob Storage deployment
- [ ] T089 Test deployment to Azure Blob Storage
- [ ] T090 Final constitution gates verification (all tests pass, coverage met, docs updated)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Independent after Phase 2
  - User Story 2 (Phase 4): Builds on User Story 1 but independently testable
  - User Story 3 (Phase 5): Builds on User Story 1 but independently testable
- **Sharing (Phase 6)**: Depends on at least User Story 1 completion
- **Enhanced UX (Phase 7)**: Can start after Phase 2, parallel with user stories
- **Performance (Phase 8)**: Depends on user stories being implemented
- **Polish (Phase 9)**: Depends on all desired features being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - MVP baseline
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 chart/results components
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1 form component

### Critical Path

1. **T001-T013**: Setup (parallelizable)
2. **T014-T024**: Foundational services (blocks everything)
3. **T025-T026**: DCA Calculator (CRITICAL - 100% coverage, blocks all user stories)
4. **T027-T037**: User Story 1 implementation (MVP)
5. Everything else can be incremental after MVP

### Parallel Opportunities

**Phase 1 (Setup)**: T003-T013 all parallel (different config files)

**Phase 2 (Foundational)**: Parallel tasks available

- T014-T017 parallel (different utility files)
- T021-T024 parallel (different test files)

**Phase 3 (User Story 1)**: Parallel tasks available

- T027-T029 parallel (SimulatorForm + tests + styles)
- T030-T032 parallel (ChartDisplay + tests + styles)
- T033-T034 parallel (ResultsSummary + tests)

**Phase 4 (User Story 2)**: Parallel tasks available

- T038-T039 parallel (AssetComparison component development)

**Phase 7 (Enhanced UX)**: Parallel tasks available

- T061-T062 parallel (independent components)
- T069-T070 parallel (different validation functions)

**Phase 8 (Performance)**: Parallel tasks available

- T071-T072 parallel (different CSS files)

**Phase 9 (Polish)**: Parallel tasks available

- T078-T081 parallel (documentation tasks)

---

## Parallel Example: User Story 1 Critical Path

```bash
# Phase 2: Launch foundational tests together
Task T021: "tests/unit/validators.test.ts"
Task T022: "tests/unit/formatters.test.ts"
<parameter name="Task T023: "tests/unit/dateHelpers.test.ts"

# Phase 3: After T025-T026 (DCA Calculator), launch UI components together
Task T027-T029: "SimulatorForm + tests + styles"
Task T030-T032: "ChartDisplay + tests + styles"
Task T033-T034: "ResultsSummary + tests"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Setup**: Complete Phase 1 (T001-T013)
2. **Foundation**: Complete Phase 2 (T014-T024) - CRITICAL blocking phase
3. **DCA Calculator**: Complete T025-T026 with 100% coverage
4. **User Story 1**: Complete Phase 3 (T027-T037)
5. **STOP and VALIDATE**: Test User Story 1 independently
6. Deploy MVP to Azure Blob Storage
7. Gather feedback before proceeding

**Estimated Tasks for MVP**: 37 tasks (T001-T037)

### Incremental Delivery

1. **Foundation Ready**: Phase 1 + Phase 2 complete (T001-T024)
2. **MVP Release**: + User Story 1 (T025-T037) → Deploy/Demo ✅
3. **Comparison Feature**: + User Story 2 (T038-T045) → Deploy/Demo ✅
4. **Parameter Editing**: + User Story 3 (T046-T054) → Deploy/Demo ✅
5. **Sharing**: + Phase 6 (T055-T060) → Deploy/Demo ✅
6. **Polish**: + Phases 7-9 (T061-T090) → Final Release ✅

### Parallel Team Strategy

With 3 developers after Phase 2 completion:

- **Developer A**: User Story 1 (T025-T037) - MVP critical path
- **Developer B**: Enhanced UX (T061-T070) - parallel with MVP
- **Developer C**: Setup Phase 8 prep (research, mobile testing) - parallel with MVP

Then after US1 complete:

- **Developer A**: User Story 2 (T038-T045)
- **Developer B**: User Story 3 (T046-T054)
- **Developer C**: Sharing functionality (T055-T060)

---

## Test-First Workflow (Constitution Requirement)

Per Constitution Principle II, ALL tasks must follow Red-Green-Refactor:

### Red Phase

1. Write test (e.g., T025 dcaCalculator.test.js)
2. Run test → Verify it FAILS
3. Commit failing test

### Green Phase

1. Write minimal implementation (e.g., T026 dcaCalculator.js)
2. Run test → Verify it PASSES
3. Commit passing implementation

### Refactor Phase

1. Improve code quality (readability, DRY, single responsibility)
2. Run test → Verify still PASSES
3. Commit refactored code

**Checkpoint Gates**:

- Before implementation: Tests exist and fail ✅
- Before commit: Tests pass, coverage meets thresholds ✅
- Before merge: All tests pass, documentation updated ✅

---

## Coverage Requirements

Per Constitution Principle II:

- **General Code**: 80% minimum coverage
- **DCA Calculator** (T025-T026): 100% coverage (CRITICAL calculation logic)
- **Services** (priceApi, cacheManager, urlSerializer): 90%+ recommended
- **Components**: 80% minimum
- **Utils**: 85%+ recommended (reusable functions)

---

## Task Completion Criteria

Each task is complete when:

1. ✅ Code written following Constitution Principle I (readability, single responsibility, DRY)
2. ✅ Tests written first and pass (Principle II)
3. ✅ ESLint passes with no warnings
4. ✅ Prettier formatting applied
5. ✅ Coverage thresholds met
6. ✅ Acceptance criteria verified (for user story tasks)
7. ✅ Code reviewed (if team > 1 person)
8. ✅ Committed to feature branch with clear message

---

## Summary Statistics

- **Total Tasks**: 90 tasks
- **User Story 1 (MVP)**: 13 implementation tasks (T025-T037)
- **User Story 2**: 8 tasks (T038-T045)
- **User Story 3**: 9 tasks (T046-T054)
- **Setup**: 13 tasks (T001-T013)
- **Foundational**: 11 tasks (T014-T024)
- **Cross-cutting**: 37 tasks (Sharing, UX, Performance, Polish)

**Parallel Opportunities**: ~35% of tasks marked [P] can run in parallel within their phase

**Critical Path**: Setup → Foundational → DCA Calculator → User Story 1 = MVP (37 tasks)

**Recommended MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only)

---

## Notes

- All file paths assume `crypto-dca-simulator/` as project root
- [P] marker indicates parallelizable tasks (different files)
- [US1/US2/US3] markers trace tasks to user stories
- DCA Calculator (T025-T026) is CRITICAL - 100% test coverage required
- Constitution gates must pass before merge to main branch
- Each user story should be independently deployable
- Stop at any checkpoint to validate story independently before proceeding
