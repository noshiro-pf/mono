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

## Architecture Overview

**ts-data-forge** is a TypeScript utility library providing type-safe functional programming utilities. Key architectural principles:

1. **Type-first design** - Heavy use of TypeScript's type system for compile-time safety
2. **Zero runtime dependencies** - Only development tooling dependencies
3. **Functional programming patterns** - Immutable data structures, Optional/Result types
4. **ESM modules** - Uses `.mts` extensions with `NodeNext` module resolution

## Module Structure

- `array/` - Array and tuple utilities with type-safe operations
- `collections/` - Immutable data structures (IMap, ISet, IMapMapped, ISetMapped) and mutable structures (Queue, Stack)
- `functional/` - FP utilities (Optional, Result, pipe, match)
- `guard/` - Type guard functions for runtime type checking
- `iterator/` - Iterator utilities (range generators)
- `json/` - JSON utilities with type safety
- `number/` - Numeric utilities including branded types and enums
- `object/` - Object manipulation utilities
- `others/` - Miscellaneous utilities (casting, memoization, tuples)
- `expect-type.mts` - Compile-time type assertions for testing

## Testing Approach

Uses **Vitest** with dual testing strategy:

1. **Compile-time type testing** via `expectType` utility
2. **Runtime behavioral testing** with standard assertions

Example pattern:

```typescript
import { expectType } from '../expect-type.mjs';

// Type-level assertion
expectType<typeof result, readonly [0, 0, 0]>('=');
// Runtime assertion
expect(result).toStrictEqual([0, 0, 0]);
```

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
- **YOU MUST**: Avoid using file scope `/* eslint disable */`.
- **IMPORTANT**: Use arrow functions in all cases
- **PREFER**: Type-safe operations over unsafe type assertions
- **PREFER**: Readonly parameter types for complex objects
- **PREFER**: Running single tests over the whole test suite for performance
- **PREFER**: ES modules (import/export) syntax over CommonJS (require)
- **PREFER**: Destructuring imports when possible (e.g., `import { foo } from 'bar'`)
    - Exceptions: Node utilities such as fs, path, url etc.
- **PREFER**: Avoid using `// eslint-disable-next-line` or `eslint-disable` as possible.
- **PREFER**: Avoid any casting as possible.
- **PREFER**: Use `expectType<A, B>('=')` whenever possible. Avoid using `expectType<A, B>('<=')` or `expectType<A, B>('!=')` except when intended.
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

## Script Organization Rules

For scripts in the `scripts/` directory, functions should be organized in call hierarchy order from top to bottom:

1. **main function** - Entry point at the top
2. **Functions directly called by main** - In order of call
3. **Functions called by level 2 functions** - Following the call chain
4. **Helper functions and utilities** - At the bottom
5. **Type definitions** - Before the functions that use them
6. **Constants and configuration** - Near the top, after imports

This organization makes scripts easier to read and understand the execution flow.

## Testing Checklist

After making changes, verify:

- [ ] `npm run tsc` - Type checking
- [ ] `npm run test` - Run all tests
- [ ] `npm run lint` - ESLint validation
- [ ] `npm run fmt` - Code formatting
- [ ] `npm run build` - Full build pipeline
