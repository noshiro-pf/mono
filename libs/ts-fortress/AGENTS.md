# Repository Guidelines

## Project Structure & Module Organization

- `src/` — TypeScript sources (`.mts`). Public API is re-exported from `src/index.mts`; keep modules small and cohesive (e.g., `array/`, `record/`, `primitives/`).
- `test/` — Integration and exploratory tests (`.mts`). Unit tests often live next to code as `*.test.mts` in `src/**`.
- `configs/` — Tooling configs (e.g., `vitest.config.ts`, tsconfig for tests).
- `scripts/` — Build/check scripts executed via `tsx`.
- `dist/` — Build output (`.mjs`, `.d.mts`). Do not edit by hand.
- `docs/`, `documents/`, `samples/`, `coverage/` — Generated docs, longer guides, sample code, and coverage reports.

## Build, Test, and Development Commands

- `npm run build` — Build library to `dist/`.
- `npm test` / `npm run testw` — Run tests once / in watch mode.
- `npm run test:ui` — Vitest UI runner; `npm run test:cov` for coverage, view with `npm run test:cov:ui`.
- `npm run lint` / `npm run lint:fix` — Lint code / auto-fix.
- `npm run type-check` — TypeScript `tsc --noEmit`.
- `npm run fmt` / `npm run fmt:full` — Format changed files / all files.
- `npm run doc` — Generate API docs; `npm run doc:embed` to embed samples.
- `npm run check-all` — Full local CI (spelling, ext check, tests, lint, build, docs, format).

## Coding Style & Naming Conventions

- Indentation: 2 spaces (Markdown uses 4 via `.editorconfig`).
- ESM-only repo (`"type": "module"`). Source files use `.mts` and import paths include `.mjs` extensions intentionally; keep this pattern.
- Prefer named exports; avoid default exports. Directories/files are lowercase with hyphens when needed.
- Run `npm run gi` after adding modules to refresh barrel exports in `src/**/index.mts`.
- Prettier + ESLint enforce style; run `lint:fix` and `fmt` before committing.
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

## Testing Guidelines

- Framework: Vitest (see `configs/vitest.config.ts`). Tests discovered in `src/**/*.mts`, `test/**/*.mts`, and `samples/**/*.mts`.
- Co-locate unit tests as `*.test.mts`; use `describe/it` with clear names. Aim to cover happy paths and validation errors.
- Generate coverage with `npm run test:cov`; open HTML report via `npm run test:cov:ui`.
- **Compile-time type testing** via `expectType` utility from `ts-data-forge`

Example pattern:

```typescript
import { expectType } from 'ts-data-forge';

// Type-level assertion
expectType<typeof result, readonly [0, 0, 0]>('=');
// Runtime assertion
expect(result).toStrictEqual([0, 0, 0]);
```

## Commit & Pull Request Guidelines

- Conventional Commits are required (semantic-release). Examples: `feat: add nonEmptyArray validator`, `fix(record): handle excess properties`, `docs: improve README`.
- Breaking changes: add `BREAKING CHANGE:` footer or use `scope: breaking` (see `BREAKING_CHANGE_GUIDE.md`).
- PRs must include: summary, rationale, screenshots for docs if relevant, and confirmation that `npm run check-all` passes. Do not bump versions; CI handles releases.
