# CLAUDE.md

## Project Overview

SynState is a lightweight, type-safe state management library for TypeScript/JavaScript. It is built on an Observable pattern (independent implementation, not RxJS) and provides reactive state, event emitters, and operators for building reactive applications.

This is a **pnpm monorepo** with five published packages and one internal docs package:

| Package                       | Path                                   | Description                                                                         |
| ----------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| `synstate`                    | `packages/synstate`                    | Core library — observables, operators, combinators, state/reducer/emitter utilities |
| `synstate-react-hooks`        | `packages/synstate-react-hooks`        | React 18+ hooks integration (`useObservableValue`, `useObservableEffect`, etc.)     |
| `synstate-react-hooks-compat` | `packages/synstate-react-hooks-compat` | React 16.8–17 hooks integration (same API, uses `useState`/`useEffect` internally)  |
| `synstate-preact-hooks`       | `packages/synstate-preact-hooks`       | Preact hooks integration (same API as React hooks)                                  |
| `synstate-preact-signals`     | `packages/synstate-preact-signals`     | Preact Signals integration (`toSignal`, `fromSignal`, fine-grained DOM updates)     |
| `@synstate/docs`              | `packages/docs`                        | Documentation site (Astro + Starlight), deployed to GitHub Pages (private)          |

## Quick Reference

```sh
# Setup
pnpm install
git submodule update --init --recursive

# Build all packages (respects dependency order)
pnpm run ws:build

# Run tests
pnpm run ws:test          # Node.js tests
pnpm run ws:test:all      # All tests including stream tests
pnpm run ws:test:browser  # Browser tests (needs Playwright)
pnpm run ws:test:cov      # Tests with coverage

# Type checking
pnpm run ws:type-check    # All packages
pnpm run check:root       # Root scripts/configs only

# Linting & formatting
pnpm run ws:lint          # Lint all packages
pnpm run ws:lint:fix      # Lint with auto-fix
pnpm run fmt              # Format uncommitted files
pnpm run fmt:full         # Format everything

# Full validation (CI equivalent)
pnpm run check-all        # Runs: install → cspell → md → ext-check → root-check → build → test:cov → lint → fmt

# Spell check & markdown lint
pnpm run cspell
pnpm run md
```

### Per-Package Commands

Run inside a package directory or via `pnpm --filter <package>`:

```sh
pnpm run build            # Build the package
pnpm run test             # Run Node.js tests
pnpm run tsc              # Type check (--noEmit)
pnpm run lint             # ESLint
pnpm run lint:fix         # ESLint with auto-fix
pnpm run fmt              # Prettier format
pnpm run gi               # Regenerate index.mts barrel files
```

## Architecture

### Core Package (`packages/synstate`)

```text
src/
├── core/
│   ├── class/           # Observable class hierarchy (RootObservable, ChildObservable)
│   ├── combine/         # Combinators: combine, merge, zip
│   ├── create/          # Factory functions: source, counter, timer, fromPromise, fromAbortablePromise, fromSubscribable
│   ├── operators/       # Pipe operators: map, filter, scan, audit, debounce, throttle, switchMap, mergeMap, pairwise, etc.
│   ├── predefined/      # Higher-level operators: pluck, skip, take, mapTo, attachIndex, mapOptional, mapResult, unwrapOptional, unwrapResult, etc.
│   ├── types/           # TypeScript type definitions for Observable family
│   └── utils/           # Internal utilities (ID generation, depth tracking)
├── utils/
│   ├── create-state.mts        # createState / createBooleanState
│   ├── create-reducer.mts      # createReducer
│   └── create-event-emitter.mts # createEventEmitter / createValueEmitter
├── entry-point.mts      # Package entry point (re-exports index)
└── index.mts            # Barrel export
```

### Framework Hooks Packages

Both `synstate-react-hooks` and `synstate-preact-hooks` share the same API surface:

- `useObservableValue` — subscribe to an observable and get its current value as React/Preact state
- `useObservableEffect` — run side effects when observable values change
- `useValueAsObservable` — convert a React/Preact value into an observable
- `createState` / `createReducer` / `createBooleanState` — re-exported wrappers

### Key External Dependencies

- **`ts-data-forge`** (`^6.8.0`) — The only runtime dependency; provides utility types and functions (`Result`, etc.)
- **`ts-repo-utils`** (`9.0.0`) — Dev tooling for monorepo management (build orchestration, index generation, etc.)
- **`ts-codemod-lib`** (`^2.1.1`) — Codemods for enforcing `as const` and `readonly` patterns
- **`eslint-config-typed`** (`4.7.5`) — Type-aware ESLint flat config

## Code Conventions

### TypeScript

- **File extension**: `.mts` for all TypeScript source files, `.tsx` for JSX
- **Module system**: ESM only (`"type": "module"`)
- **Import extensions**: Always use `.mjs` in import paths (e.g., `import { foo } from './bar.mjs'`)
- **Immutability**: The codebase enforces `readonly` types and `as const` assertions via codemods (`pnpm run codemod`)
- **Mutable variables**: Prefix mutable variables/arrays with `mut_` (e.g., `const mut_history: number[] = []`)
- **No default exports**: Prefer named exports everywhere
- **Strict TypeScript**: Strict mode enabled; explicit return types on public functions

### Formatting

- **Prettier** with `singleQuote: true`, `semi: true`, `endOfLine: lf`
- **Indent**: 2 spaces (4 spaces for markdown files)
- **Plugins**: `prettier-plugin-organize-imports`, `prettier-plugin-packagejson`

### Linting

- **ESLint** flat config (`eslint.config.mts`) using `eslint-config-typed`
- Type-aware rules are enabled
- Import ordering and restrictions are enforced

### Testing

- **Vitest** for all tests
- Test files are colocated in source (`*.test.mts`) or in `test/` directories
- Stream-based tests use a separate vitest config (`vitest.config.stream.ts`)
- Browser tests run via `@vitest/browser-playwright`

### Git Conventions

- **Commit messages**: Conventional Commits format — `type: description`
    - Types: `feat`, `fix`, `chore`, `ci`, `docs`, `refactor`, `test`
- **Changesets**: Use `@changesets/cli` for versioning. Add changesets for user-facing changes via `pnpm changeset`
- **Branch protection**: `main` branch is protected; PRs required
- **Base branch**: `main`

### Barrel Files (Index Generation)

Index files (`index.mts`) are auto-generated. Run `pnpm run gi` in a package to regenerate. Do not manually edit `index.mts` files.

## CI/CD

GitHub Actions workflows:

| Workflow            | Trigger            | What it does                                                                         |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------ |
| **Style Check**     | Push (non-develop) | Runs: `fmt:full`, `md`, `cspell`, `ws:doc`, `ws:check:ext`                           |
| **Type Check**      | Push (non-develop) | Runs: `check:root`, `ws:type-check`, `ws:lint:fix`, `ws:test:browser`, `ws:test:cov` |
| **Release**         | Push to `main`     | Changesets: creates version PR or publishes to npm                                   |
| **Lint PR**         | PR events          | Validates PR title format (conventional commits)                                     |
| **Auto Merge**      | PR events          | Auto-merges Dependabot PRs                                                           |
| **Node Compat**     | Push               | Tests across Node.js 20.20.0, 22.22.0, 24.13.0, 25.4.0                               |
| **Deploy Docs**     | Docs build         | Deploys documentation site to GitHub Pages                                           |
| **Backup Settings** | Scheduled          | Backs up GitHub repository settings                                                  |

CI asserts a clean repo after each check (`assert-repo-is-clean`), so formatting and codegen must be committed.

## Build System

- Packages are built via `tsx ./scripts/cmd/build.mts` (per-package)
- Workspace-wide build uses `tsx ./scripts/cmd/ws-build-stages.mts` which builds in dependency order
- Output: `dist/` directory with `.mjs` and `.d.mts` files
- Rollup is used for bundling with TypeScript plugin

## Tips for AI Assistants

1. **Always build before testing** — hooks packages depend on the built core package (`synstate`)
2. **Use `.mjs` import extensions** — not `.mts` or extensionless
3. **Run `pnpm run gi`** after adding/removing source files to regenerate barrel exports
4. **Run `pnpm run codemod`** after writing new code to apply `readonly`/`as const` transformations
5. **Don't edit `index.mts` files manually** — they are auto-generated
6. **Prefix mutable bindings** with `mut_`
7. **Test changes** with `pnpm run ws:test` and type-check with `pnpm run ws:type-check`
8. **Format before committing** with `pnpm run fmt`

## Git Submodules

```text
agents/common → https://github.com/noshiro-pf/common-agent-config.git
```

Run `git submodule update --init --recursive` after cloning.
