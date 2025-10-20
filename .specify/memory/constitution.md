<!--
SYNC IMPACT REPORT
==================
Version Change: Template → 1.0.0
Modified Principles: All principles newly defined
Added Sections:
  - Core Principles (4 principles)
  - Documentation Standards
  - Development Workflow
  - Governance
Removed Sections: None (initial version)
Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - User scenario format supports UX consistency
  ✅ tasks-template.md - Test-first approach reflected in task ordering
Follow-up TODOs: None
-->

# Trading Tools Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

Code MUST be clean, readable, and maintainable at all times:

- **Readability First**: Code is written for humans first, machines second. Use clear variable names, meaningful function names, and self-documenting code.
- **Single Responsibility**: Each function, class, or module MUST have one clear purpose. If you cannot describe it in one sentence, it needs refactoring.
- **DRY Principle**: Do not repeat yourself. Extract common logic into reusable functions or utilities.
- **No Magic Numbers**: All constants MUST be named and documented. Use configuration files or enums for values that may change.
- **Type Safety**: Use type hints (Python), TypeScript (JavaScript), or language-appropriate type systems to catch errors early.
- **Code Reviews Required**: All code changes MUST be reviewed by at least one other developer before merging.

**Rationale**: Trading tools handle financial data and decisions. Poor code quality leads to bugs that can result in financial losses. Clean code is easier to audit, test, and maintain.

### II. Testing Standards (NON-NEGOTIABLE)

Comprehensive testing is mandatory across all projects:

- **Test-First Development**: Tests MUST be written before implementation (Red-Green-Refactor cycle).
- **Test Coverage**: Minimum 80% code coverage for all production code. Critical trading logic MUST have 100% coverage.
- **Test Types Required**:
  - **Unit Tests**: Test individual functions and classes in isolation
  - **Integration Tests**: Test component interactions and data flow
  - **Contract Tests**: Test API contracts and external interfaces
  - **Edge Case Tests**: Test boundary conditions, error scenarios, and failure modes
- **Automated Testing**: All tests MUST run automatically in CI/CD pipeline. Tests MUST pass before any merge to main branch.
- **Test Documentation**: Each test MUST clearly state what it tests and why (Given-When-Then format).
- **No Skipped Tests**: Tests cannot be disabled or skipped without explicit justification and tracking ticket.

**Rationale**: Trading decisions based on incorrect calculations or data can be catastrophic. Comprehensive testing ensures reliability and catches regressions early.

### III. User Experience Consistency

User interfaces and interactions MUST be consistent and intuitive:

- **Consistent Patterns**: Use the same patterns for similar operations across all tools (e.g., configuration, error messages, output formats).
- **Clear Error Messages**: Error messages MUST explain what went wrong, why it matters, and how to fix it.
- **Progressive Disclosure**: Show simple interfaces by default, expose complexity only when needed.
- **Standardized Outputs**: Support both human-readable and machine-readable (JSON) output formats where applicable.
- **Feedback Loop**: All operations MUST provide immediate feedback (progress indicators, confirmation messages, error states).
- **Accessibility**: Command-line tools MUST support standard input/output conventions. Web interfaces MUST follow WCAG 2.1 Level AA guidelines.
- **Documentation-First UX**: Every feature MUST have usage examples before implementation begins.

**Rationale**: Traders need to focus on strategy, not wrestling with tools. Consistent UX reduces cognitive load, minimizes errors, and accelerates adoption.

### IV. Simplicity (NON-NEGOTIABLE)

Start simple and add complexity only when necessary:

- **YAGNI**: "You Aren't Gonna Need It" - Do not build features speculatively. Implement only what is needed now.
- **Minimal Dependencies**: Each dependency MUST be justified. Fewer dependencies mean fewer security vulnerabilities and easier maintenance.
- **Clear Architecture**: Prefer simple, obvious solutions over clever ones. If a junior developer cannot understand the code, it is too complex.
- **Incremental Delivery**: Deliver smallest viable increments. One working feature is better than three half-finished ones.
- **No Premature Optimization**: Optimize only after measuring performance bottlenecks. Readable code first, fast code second.
- **Delete Before Adding**: Before adding new code, consider if existing code can be deleted or refactored instead.
- **Complexity Justification**: Any complexity MUST be justified in writing with a clear explanation of why simpler alternatives were insufficient.

**Rationale**: Trading systems are inherently complex. Simple code is easier to reason about, debug, test, and modify when market conditions or requirements change.

## Documentation Standards

All subprojects MUST maintain current documentation:

- **README.md Required**: Each subproject MUST have a README explaining:
  - What the project does (one-sentence summary)
  - How to install and configure it
  - Basic usage examples
  - Project structure overview
  - How to run tests
  - How to contribute
- **Update Trigger**: Documentation MUST be updated whenever:
  - New features are added
  - APIs or interfaces change
  - Configuration options change
  - Project structure is modified
- **No Stale Docs**: Outdated documentation is worse than no documentation. If something changes, update the docs in the same commit/PR.
- **Living Documentation**: READMEs are not write-once artifacts. They evolve with the project.

**Rationale**: Good documentation reduces onboarding time, prevents misuse, and serves as a contract for how components should behave.

## Development Workflow

### Constitution Check Gates

All feature work MUST pass these gates:

1. **Before Implementation Begins**:
   - Spec MUST define acceptance tests (Principle III)
   - Complexity MUST be justified if introducing new dependencies or architectural patterns (Principle IV)
   - UX patterns MUST be consistent with existing tools (Principle III)
   
2. **During Implementation**:
   - Tests MUST be written first and MUST fail before implementation (Principle II)
   - Code reviews MUST verify readability and single responsibility (Principle I)
   
3. **Before Merge**:
   - All automated tests MUST pass (Principle II)
   - Code coverage MUST meet minimum thresholds (Principle II)
   - Documentation MUST be updated if interfaces changed (Documentation Standards)

### Quality Gates

- **Linting**: All code MUST pass linting (language-specific: pylint/black for Python, ESLint/Prettier for JavaScript).
- **Type Checking**: All code MUST pass type checking where applicable (mypy for Python, TypeScript for JavaScript).
- **Security Scanning**: Dependencies MUST be scanned for known vulnerabilities. High/Critical CVEs MUST be addressed before merge.
- **Performance Baseline**: Critical paths (data processing, calculations) MUST maintain or improve performance benchmarks.

## Governance

This constitution supersedes all other development practices and guidelines.

### Amendment Process

- **Proposal**: Any team member can propose amendments via documented RFC (Request for Comments)
- **Review Period**: Minimum 7 days for team review and discussion
- **Approval**: Requires consensus from majority of active contributors
- **Migration Plan**: Breaking changes MUST include migration guide and grace period

### Version Semantics

- **MAJOR**: Backward-incompatible governance changes, principle removals or redefinitions
- **MINOR**: New principles added, material expansions to existing principles
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Enforcement

- All pull requests MUST verify constitution compliance
- Code reviewers MUST flag violations with specific principle references
- Complexity violations MUST be justified in PR description with tracking ticket
- Principle violations without justification will not be merged

### Compliance Review

- **Quarterly**: Review adherence to principles, identify systematic violations
- **Continuous**: Monitor test coverage, code quality metrics, documentation freshness
- **Retrospectives**: Evaluate if principles support or hinder development velocity

**Version**: 1.0.0 | **Ratified**: 2025-10-20 | **Last Amended**: 2025-10-20
