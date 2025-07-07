# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Setup and Installation

```bash
# Initial setup after clone
yarn setup

# Install dependencies
yarn
```

### Build Commands

```bash
# Build all workspaces
yarn ws:build

# Build only utilities
yarn ws:build:utils

# Build only apps
yarn ws:build:apps

# Build configs and generate shared configurations
yarn build:configs
```

### Development Commands

```bash
# Type check all workspaces
yarn ws:type-check

# Lint all workspaces
yarn ws:lint

# Run tests across workspaces
yarn ws:test

# Format code (changed files from main)
yarn fmt

# Format all code
yarn fmt:all
```

### CI Commands

```bash
# Full CI pipeline
yarn ci

# CI with clean build
yarn ci:clean-build-and-cache

# CI with clean install
yarn ci:clean-install
```

### Creating New Workspaces

```bash
# Create new React app
yarn create:react-app <package-name>

# Create new Preact app
yarn create:preact-app <package-name>

# Create new utility package
yarn create:util <package-name>

# Create new slides
yarn create:slides <package-name>
```

## Repository Architecture

### Workspace Structure

-   `/packages/apps/` - React/Preact applications built with Vite
-   `/packages/utils/` - TypeScript utility libraries built with Rollup
-   `/packages/eslint-configs/` - Shared ESLint configurations
-   `/packages/slides/` - Reveal.js presentations
-   `/configs/` - Shared TypeScript and build configurations
-   `/scripts/` - Build automation and tooling scripts
-   `/experimental/` - Unmaintained code (excluded from CI)

### Key Patterns

#### Global Utilities System

-   `global-*` packages provide auto-imported utilities to apps
-   No explicit imports needed for common functions/hooks
-   Generated through Vite's inject plugin
-   Global type definitions generated via `gen-global-dts.mjs`

#### Shared Configuration

-   TypeScript configs in `/configs/tsconfig/` for different use cases
-   ESLint configs generated from TypeScript with full type safety
-   Rollup/Vite configs shared across workspaces
-   Auto-generated workspace configurations

#### Build System

-   **Wireit**: Orchestrates command dependencies
-   **wsrun**: Executes commands across workspaces with dependency awareness
-   **npm-run-all**: Parallel/serial execution within workspaces
-   Build order: configs → mono-utils → utils → apps

### Development Workflow

1. **Initial Setup**: Run `yarn setup` after clone
2. **Config Generation**: Configs are auto-generated from templates
3. **Build Process**: Utils build first, then apps (dependency-aware)
4. **Global Utilities**: Built separately and injected into apps

### Package Management

-   All packages use `@noshiro/` namespace
-   Dependencies centralized in root `package.json`
-   TypeScript version unified across monorepo
-   Utils packages can be published, apps are private

### Key Conventions

-   `.mts` extensions for TypeScript modules
-   `esm/` directory for utility build outputs
-   `/configs/` subdirectory per workspace
-   Script naming: `z:` or `zz:` prefix for internal commands
-   Strict TypeScript settings enabled (`noUncheckedIndexedAccess`, etc.)

### Testing

-   Vitest with Happy DOM for apps
-   Type-checked tests
-   Test command: `yarn ws:test`

### Linting

-   ESLint flat config with explicit rule definitions
-   No preset extends - all rules explicitly defined
-   Generated from TypeScript with full type safety
-   Auto-fix: `yarn ws:lint:fix`

## Development Guidelines

### Important Patterns

-   **Immutability**: Functions return immutable data structures
-   **Type Safety**: Leverage `ts-type-forge` for advanced TypeScript patterns
-   **Export Strategy**: All exports go through generated index files
-   **Documentation**: Auto-generated from TSDoc comments using TypeDoc
-   **File Extensions**: Use `.mts` for TypeScript files to ensure ESM compatibility
-   **Type Guards**: Prefer type guard functions over type assertions

### Testing Approach

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

### Configuration Notes

-   **TypeScript**: Strict mode with `noUncheckedIndexedAccess: true` for enhanced type safety
-   **ESLint**: Custom rules including:
    -   Ban on `object` type (use specific interfaces)
    -   Enforce `Object.hasOwn()` over `hasOwnProperty()`
    -   Prefer readonly parameter types
-   **Build**: Rollup bundler with automatic index file generation
-   **Tests**: Co-located with source files using `.test.mts` suffix
-   **Module Resolution**: `NodeNext` for proper ESM support

### Notes for Development

-   Always run `yarn setup` after cloning or major changes
-   Use workspace creation commands rather than manual setup
-   Global utilities are available without imports in apps
-   Build order matters - utils must be built before apps
-   ESLint configs are generated code - modify source in `eslint-configs` package
-   TypeScript configs are shared - extend from `/configs/tsconfig/`
-   File extensions matter - use `.mts` for TypeScript modules

## Code Style Guidelines

-   **NEVER**: Use `as any`, `as never`, or `@ts-ignore` (use `@ts-expect-error` when absolutely necessary)
-   **YOU MUST**: Use `.toStrictEqual()` instead of `.toEqual()` in Vitest tests
-   **YOU MUST**: Use `test()` instead of `it()` in Vitest tests
-   **YOU MUST**: Use named exports unless restricted by libraries or frameworks
-   **YOU MUST**: Avoid using file scope `/* eslint disable */`.
-   **IMPORTANT**: Use arrow functions in all cases
-   **PREFER**: Type-safe operations over unsafe type assertions
-   **PREFER**: Readonly parameter types for complex objects
-   **PREFER**: Running single tests over the whole test suite for performance
-   **PREFER**: ES modules (import/export) syntax over CommonJS (require)
-   **PREFER**: Destructuring imports when possible (e.g., `import { foo } from 'bar'`)
    -   Exceptions: Node utilities such as fs, path, url etc.
-   **PREFER**: Avoid using `// eslint-disable-next-line` or `eslint-disable` as possible.
-   **PREFER**: Avoid any casting as possible.
-   **PREFER**: Use `expectType<A, B>('=')` whenever possible. Avoid using `expectType<A, B>('<=')` or `expectType<A, B>('!=')` except when intended.
-   **RESTRICTIONS**: Do not perform these actions without explicit user instructions:
    -   Push to GitHub or remote repositories
    -   Access `~/.ssh` or other sensitive directories

## Test-Driven Development (TDD)

When implementing new features, follow TDD workflow:

1. **Write Tests First**: Create tests based on expected inputs and outputs
2. **Verify Test Failure**: Run tests to confirm they fail as expected
3. **Implement Code**: Write minimal code to make tests pass
4. **Refactor**: Improve code while keeping tests green
5. **Repeat**: Continue cycle for additional functionality

**Important**: During implementation, avoid modifying tests unless requirements change
