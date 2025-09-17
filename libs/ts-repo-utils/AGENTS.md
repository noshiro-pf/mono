# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains strict ESM TypeScript (`.mts`) modules; CLI entry points live under `src/cmd/`.
- Co-locate tests next to sources as `*.test.mts`; keep fixtures lightweight.
- Build and release automation resides in `scripts/`; configuration in `configs/`; generated outputs appear only in `dist/` and must not be edited.
- Usage samples live in `samples/`; API docs are regenerated into `docs/`.

## Build, Test, and Development Commands

- `npm run build` performs the full pipeline: lint, type-check, index generation, and Rollup bundling.
- `npm test` runs the Vitest suite once; append a path (`npm test -- src/foo/bar.test.mts`) to focus on a file.
- `npm run tsc` runs a standalone type-check; `npm run lint` and `npm run lint:fix` enforce ESLint rules.
- `npm run fmt` formats staged files; use `fmt:diff` before PRs to align with main.
- `npm run check-all` is the pre-PR gate covering lint, tests, build, docs, and backups.

## Coding Style & Naming Conventions

- Use TypeScript with named exports, arrow functions, and no `any` unless justified.
- Formatting: 2-space indent, LF endings, single quotes, and semicolons, enforced by Prettier with organize-imports.
- Keep module names descriptive (e.g., `src/functions/resolve-path.mts`); align CLI commands with file names in `src/cmd/`.

## Testing Guidelines

- Tests use Vitest globals; import utilities explicitly when outside the project scope.
- Prefer `test(...)` and `expect(...).toStrictEqual(...)` for deterministic comparisons.
- Aim for coverage parity with existing modules; run `npm run test:cov` for enforcement and `npm run test:cov:ui` to inspect reports.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`feat: add workspace stage runner`, `fix(exec): handle non-zero exit codes`).
- Document breaking changes with `BREAKING CHANGE:` in the commit body.
- Before opening a PR, run `npm run check-all`, `npm run fmt`, and `npm exec -- assert-repo-is-clean` to ensure no drift from `origin/main`.
- PR descriptions should reference related issues and include CLI examples when behavior changes.

## Security & Configuration Tips

- GitHub automation rely on `.env` with `PERSONAL_ACCESS_TOKEN`; copy from `.env.example` and never commit secrets.
- Keep credentials out of tests and samples; scrub logs before sharing.
- Treat `dist/` and `docs/` as generated artifacts—modify sources, then rebuild.
