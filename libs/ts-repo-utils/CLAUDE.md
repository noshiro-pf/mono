# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

**Testing:**

- `npm test` - Run all tests with Vitest
- `npm run testw` - Run tests in watch mode
- `npm run test -- path/to/test.mts` - Run specific test file

**Build & Validation:**

- `npm run build` - Full build pipeline (generates indexes, type-checks, bundles)
- `npm run tsc` - Type checking only
- `npm run check-all` - Comprehensive validation (lint, test, build)

**Code Quality:**

- `npm run lint` - ESLint checking
- `npm run fmt` - Prettier formatting

## Important Instructions

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (\*.md) or README files unless explicitly requested

## Configuration Notes

- **TypeScript**: Strict mode with `noUncheckedIndexedAccess: true` for enhanced type safety
- **ESLint**: Custom rules including:
    - Ban on `object` type (use specific interfaces)
    - Enforce `Object.hasOwn()` over `hasOwnProperty()`
    - Prefer readonly parameter types
- **Build**: Rollup bundler with automatic index file generation
- **Tests**: Co-located with source files using `.test.mts` suffix
- **Module Resolution**: `NodeNext` for proper ESM support

## Important Patterns

- **Immutability**: Functions return immutable data structures
- **Type Safety**: Leverage `ts-type-forge` for advanced TypeScript patterns
- **Export Strategy**: All exports go through generated index files
- **Documentation**: Auto-generated from TSDoc comments using TypeDoc
- **File Extensions**: Use `.mts` for TypeScript files to ensure ESM compatibility
- **Type Guards**: Prefer type guard functions over type assertions

## Code Style Guidelines

- **NEVER**: Use `as any`, `as never`, or `@ts-ignore` (use `@ts-expect-error` when absolutely necessary)
- **YOU MUST**: Use `.toStrictEqual()` instead of `.toEqual()` in Vitest tests
- **YOU MUST**: Use `test()` instead of `it()` in Vitest tests
- **YOU MUST**: Use named exports unless restricted by libraries or frameworks
- **IMPORTANT**: Use arrow functions in all cases
- **PREFER**: Type-safe operations over unsafe type assertions
- **PREFER**: Readonly parameter types for complex objects
- **PREFER**: Running single tests over the whole test suite for performance
- **PREFER**: ES modules (import/export) syntax over CommonJS (require)
- **PREFER**: Destructuring imports when possible (e.g., `import { foo } from 'bar'`)
- **PREFER**: Avoid using `// eslint-disable-next-line` or `eslint-disable` as possible.
- **PREFER**: Avoid any casting as possible.
- **RESTRICTIONS**: Do not perform these actions without explicit user instructions:
    - Push to GitHub or remote repositories
    - Access `~/.ssh` or other sensitive directories

## Test-Driven Development (TDD)

When implementing new features, follow TDD workflow:

1. **Write Tests First**: Create tests based on expected inputs and outputs
2. **Verify Test Failure**: Run tests to confirm they fail as expected
3. **Implement Code**: Write minimal code to make tests pass
4. **Refactor**: Improve code while keeping tests green
5. **Repeat**: Continue cycle for additional functionality

**Important**: During implementation, avoid modifying tests unless requirements change

## Testing Checklist

After making changes, verify:

- [ ] `npm run tsc` - Type checking
- [ ] `npm run test` - Run all tests
- [ ] `npm run lint` - ESLint validation
- [ ] `npm run fmt` - Code formatting
- [ ] `npm run build` - Full build pipeline
