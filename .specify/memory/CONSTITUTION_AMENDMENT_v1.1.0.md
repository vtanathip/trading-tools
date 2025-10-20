# Constitution Amendment: TypeScript Mandate

**Version**: 1.0.0 → 1.1.0  
**Amendment Date**: 2025-10-20  
**Type**: MINOR (Material expansion of existing principle)

## Summary

The Trading Tools Constitution has been amended to **mandate TypeScript usage** for all JavaScript/Node.js projects. This is a material expansion of Principle I (Code Quality - Type Safety), elevating TypeScript from optional to mandatory.

## Changes Made

### 1. Constitution Core Document (`.specify/memory/constitution.md`)

**Principle I (Code Quality) - Type Safety Section** expanded:

**Before**:
```markdown
- **Type Safety**: Use type hints (Python), TypeScript (JavaScript), or language-appropriate type systems to catch errors early.
```

**After**:
```markdown
- **Type Safety (MANDATORY)**:
  - **TypeScript Required**: All JavaScript/Node.js projects MUST use TypeScript exclusively. Plain JavaScript (.js) files are NOT permitted except for configuration files (e.g., jest.config.js, .eslintrc.js) where TypeScript support is limited.
  - **Strict Mode**: TypeScript MUST be configured with `strict: true` in tsconfig.json. No implicit any types allowed.
  - **Type Coverage**: Minimum 95% type coverage. Use `any` or `unknown` types only with explicit justification and tracking ticket.
  - **Python Projects**: Use type hints with mypy in strict mode.
  - **No Type Escape Hatches**: Avoid `@ts-ignore`, `@ts-expect-error`, or type assertions (`as`) without documented justification.
```

**Rationale Added**:
> TypeScript's static analysis provides documentation through types and enables powerful IDE features (autocomplete, refactoring, navigation). Plain JavaScript's dynamic typing creates maintenance burden and hides bugs until runtime—unacceptable for financial tools.

**Quality Gates Updated**:
- Linting now specifies "ESLint/Prettier for TypeScript" instead of "for JavaScript"
- Type checking now requires `tsc --noEmit` with `strict: true` to pass with zero errors
- Added type coverage reporting requirement

### 2. Plan Template (`.specify/templates/plan-template.md`)

**Technical Context Section**:
- Updated `Language/Version` example to lead with TypeScript 5.x
- Added new field: `TypeScript Config` for JS/Node.js projects

**Constitution Check Gates**:
- Added: "TypeScript configured with strict mode for JavaScript/Node.js projects (Principle I)"
- Added: "TypeScript strict type checking passes with zero errors (Principle I)"
- Added: "TypeScript compilation (`tsc --noEmit`) passes with zero errors (Principle I)"
- Added: "Type coverage meets 95% minimum threshold (Principle I)"

### 3. Tasks Template (`.specify/templates/tasks-template.md`)

**Phase 1: Setup**:
```markdown
- [ ] T003 [P] Configure TypeScript with strict mode (for JS/Node.js projects) - tsconfig.json with `"strict": true`
- [ ] T004 [P] Configure linting and formatting tools (ESLint for TypeScript, Prettier)
- [ ] T005 [P] Setup type checking in CI/CD pipeline (`tsc --noEmit` must pass)
```

**Phase 2: Foundational**:
```markdown
- [ ] T012 [P] Create shared TypeScript types and interfaces in types/ directory (for JS/Node.js projects)
```

### 4. Spec Template (`.specify/templates/spec-template.md`)

**New Section Added - Technical Constraints**:
```markdown
### Technical Constraints (Constitution-Mandated)

**For JavaScript/Node.js Projects**:
- **TC-001**: All code MUST be written in TypeScript with `strict: true` configuration (Constitution Principle I)
- **TC-002**: Type coverage MUST be ≥95% (Constitution Principle I)
- **TC-003**: `tsc --noEmit` MUST pass with zero errors before merge (Constitution Principle I)
```

## Version Bump Rationale

**Why MINOR (1.0.0 → 1.1.0) and not MAJOR?**

- TypeScript was already mentioned in the original Type Safety principle
- This amendment **expands and formalizes** existing guidance rather than introducing entirely new governance
- It does NOT remove or redefine existing principles
- It does NOT change the amendment process or governance structure
- Projects can still use other languages (Python, Rust, Swift) - only JS/Node.js projects are affected

**Why not PATCH?**
- This is a **material expansion** with enforcement requirements, not just clarification
- Adds specific technical requirements (strict mode, type coverage thresholds, CI/CD gates)
- Requires process changes (type checking in CI, coverage reporting)

## Impact Assessment

### Immediate Impact

**Current Feature: crypto-dca-simulator**
- ⚠️ **VIOLATION**: Currently implemented in plain JavaScript (.js files)
- 📋 **Action Required**: Migration to TypeScript required
- 🗓️ **Tracking**: Should be tracked as technical debt / follow-up work

### Migration Guidance

For existing JavaScript projects:

1. **Phase 1: Setup**
   - Install TypeScript: `npm install --save-dev typescript @types/node @types/react @types/jest`
   - Create `tsconfig.json` with `strict: true`
   - Update build scripts to use `tsc`

2. **Phase 2: Incremental Migration**
   - Rename `.js` → `.tsx` (React components) or `.ts` (other files)
   - Fix type errors revealed by strict mode
   - Add explicit return types to functions
   - Define interfaces for complex objects

3. **Phase 3: Type Coverage**
   - Install type coverage tool: `npm install --save-dev type-coverage`
   - Run: `npx type-coverage --detail`
   - Aim for 95% coverage

4. **Phase 4: CI/CD Integration**
   - Add `tsc --noEmit` to CI pipeline
   - Add type coverage checks
   - Block merges on type errors

### Exception Process

If a project legitimately cannot use TypeScript:

1. Create RFC documenting why TypeScript is unsuitable
2. Get approval from majority of active contributors
3. Document exception in project README
4. Create tracking ticket for periodic re-evaluation

## Compliance Checklist

For all new JavaScript/Node.js features:

- [ ] `tsconfig.json` exists with `"strict": true`
- [ ] All source files use `.ts` or `.tsx` extensions
- [ ] `tsc --noEmit` passes with zero errors
- [ ] Type coverage ≥95%
- [ ] ESLint configured with `@typescript-eslint/parser`
- [ ] CI/CD runs type checking before tests
- [ ] No `@ts-ignore` or `@ts-expect-error` without justification
- [ ] Configuration files (jest.config.js, etc.) documented as exceptions

## Suggested Commit Message

```
docs: amend constitution to v1.1.0 (mandate TypeScript for JS/Node.js)

BREAKING CHANGE: All JavaScript/Node.js projects must now use TypeScript
exclusively with strict mode enabled. Plain JavaScript files are no longer
permitted except for configuration files with limited TS support.

Constitution changes:
- Principle I (Code Quality): Expanded Type Safety to mandate TypeScript
- Added specific requirements: strict mode, 95% type coverage, CI/CD gates
- Updated rationale: Type safety prevents runtime bugs in financial tools

Template updates:
- plan-template.md: Added TypeScript config field and type check gates
- spec-template.md: Added Technical Constraints section for TS requirements
- tasks-template.md: Added TS setup tasks in Phase 1

Follow-up required:
- Migrate crypto-dca-simulator from JavaScript to TypeScript
- Update ESLint configuration templates
- Add TypeScript version requirements to docs

Refs: Constitution Principle I (Code Quality - Type Safety)
```

## Next Steps

1. **Immediate**: Commit constitution amendment and template updates
2. **Short-term** (next sprint):
   - Create tracking issue for crypto-dca-simulator migration
   - Update project setup documentation
   - Create TypeScript configuration templates
3. **Medium-term** (next month):
   - Complete crypto-dca-simulator migration
   - Document migration patterns for future reference
   - Update onboarding documentation

## Questions & Answers

**Q: Why TypeScript instead of JSDoc type annotations?**
A: TypeScript provides compile-time checking, better tooling, and enforces types. JSDoc is optional and not checked by default.

**Q: What about performance overhead?**
A: TypeScript compiles to JavaScript. Zero runtime overhead. Build times increase slightly but caught bugs save far more time.

**Q: Can we use `any` for complex third-party types?**
A: Use `unknown` instead and narrow with type guards. `any` requires justification and tracking ticket.

**Q: What about gradual migration of existing projects?**
A: Use `allowJs: true` temporarily, but all NEW code must be TypeScript. Set migration deadline for legacy files.

---

**Amendment Effective**: 2025-10-20  
**Next Constitution Review**: 2026-01-20 (Quarterly)
