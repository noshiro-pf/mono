# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

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

### Testing

- Tests are type-level only using the custom `expectType` utility in `test/expect-type.mts`
- Test files mirror the source structure in the `test/` directory
- Tests verify type correctness using assertions like:

    ```typescript
    expectType<TypeEq<string, string>, true>('=');
    expectType<StrictOmit<{ a: 1; b: 2 }, 'a'>, { b: 2 }>('=');
    ```

#### Type Testing Approach

The `expectType` utility provides a DSL for type assertions:

- `"="`: Exact type equality
- `"~="`: Mutual extension (A extends B and B extends A)
- `"<="`: A extends B
- `">="`: B extends A
- `"!="`, `"!<="`, `"!>="`: Negated versions

## Architecture Overview

### Type-Level Only Library

This is a pure TypeScript type utility library with **no runtime code**. All files in `src/` are `.d.mts` declaration files that provide type-level operations.

### Module Organization

Types are organized into logical categories:

- **condition/**: Type predicates (IsNever, IsUnion, TypeEq, etc.)
- **constants/**: Common type constants (Primitive, FalsyValue, etc.)
- **record/**: Object type utilities (DeepReadonly, StrictOmit, etc.)
- **tuple-and-list/**: Array/tuple operations (List namespace, Tuple operations)
- **type-level-integer/**: Numeric type operations (UintRange, Increment, etc.)
- **others/**: Miscellaneous utilities (JsonValue, Mutable, etc.)
- **branded-types/**: Nominal typing utilities

### Key Patterns

1. **Triple-Slash References**: The main `index.d.mts` uses triple-slash directives to include all types globally
2. **Namespace Pattern**: Complex utilities like `List` use namespaces to group related operations
3. **Recursive Types**: Many operations use recursive conditional types for tuple/object manipulation
4. **Delegation**: List operations often delegate to Tuple operations for fixed-length arrays
5. **Readonly by Default**: Most returned types are readonly to promote immutability

### File Naming Convention

- All type definition files use `.d.mts` extension
- Test files use `.mts` extension
- Documentation is auto-generated in the `docs/` directory

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
- **YOU MUST**: Avoid using file scope `/* eslint-disable */`.
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
