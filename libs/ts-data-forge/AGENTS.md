# Repository Guidelines

## Project Structure & Module Organization

- `src/` — ESM TypeScript modules (`.mts`); submodules like `array/`, `functional/`, `guard/`. Place tests beside sources as `*.test.mts`.
- `samples/` — usage examples and sample tests (`.mts`, `.tsx`).
- `configs/` — build/test configs (`rollup`, `vitest`, `tsconfig`).
- `scripts/` — repo automation (`scripts/cmd/*.mts`).
- `dist/` — generated ESM output (`.mjs`) and types; do not edit.
- `docs/`, `coverage/` — generated docs and reports.
- Node `>= 20.11`; package is `type: module`.

## Build, Test, and Development Commands

- `npm run check-all` — install, spell-check, lint, test, build, docs, samples.
- `npm run build` — validates, type-checks, Rollup build with preserved modules → `dist/`.
- Tests: `npm test`, `npm run testw`, `npm run test:ui`, `npm run test:cov`.
- Lint/format: `npm run lint`, `npm run lint:fix`, `npm run fmt`, `npm run fmt:full`.
- Type check: `npm run tsc`, `npm run type-check:samples`.
- Docs: `npm run doc`.

## Coding Style & Naming Conventions

- Formatting via Prettier (LF, semicolons, single quotes). Indent: 2 spaces (Markdown: 4). `.editorconfig` enforced.
- ESLint with TypeScript, import, unicorn, functional, promise, security, vitest plugins.
- Prefer arrow functions; avoid `any`; explicit return types for public APIs; favor immutability.
- Imports: use relative paths within `src/`; do not import from `dist/`; avoid absolute `src/**` imports.
- File extensions: `src/` and `scripts/` use `.mts`; build emits `.mjs`. Generate indexes with `npm run gi`.
- Names: functions camelCase; types/interfaces PascalCase; constants UPPER_SNAKE_CASE; files kebab-case.

## Testing Guidelines

- Framework: Vitest (globals enabled). Co-locate tests as `*.test.mts` in `src/`; sample tests live in `samples/`.
- Type-level checks with `src/expect-type.mts` (`expectType<Actual, Expected>('=')`). Runtime checks with `expect(...)`.
- Coverage (v8) outputs to `coverage/`: `npm run test:cov`. Add tests for new/changed code.

## Commit & Pull Request Guidelines

- Conventional Commits drive releases (semantic-release). Example: `feat(array): add isNonEmpty`.
- For breaking changes, follow `BREAKING_CHANGE_GUIDE.md` and include a `BREAKING CHANGE:` footer.
- PRs: clear description, linked issues, updated tests/docs, and green `npm run check-all`. Do not commit generated `dist/` or `coverage/`.

## Agent Tips

- After adding modules, run `npm run gi` to refresh index files.
- Keep changes small and within the existing module layout.
- Prefer using the provided npm scripts over ad hoc commands.
