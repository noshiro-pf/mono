# Repository Guidelines

## Project Structure & Module Organization

The ESLint config source sits in `src/`, organized by responsibility: `configs/` for build and test presets, `plugins/` and `rules/` for exported rule collections, `types/` for shared TypeScript declarations, and `custom-rules/` for repository-only rules. Utility scripts live in `scripts/`, with CLI helpers under `scripts/cmd/`. Configuration inputs (Rollup, Vitest, tsconfig variants) are in `configs/`. Generated artifacts land in `dist/`—never edit that directory directly.

## Build, Test, and Development Commands

Run `pnpm run build` for the full pipeline: cleans `dist/`, type-checks, bundles, and regenerates indexes. Use `pnpm run test` for Vitest with type-checking; switch to `pnpm run testw` for watch mode or `pnpm run test:cov` for coverage plus `pnpm run test:cov:ui` to inspect reports. `pnpm run lint` (or `pnpm run lint:fix`) validates the flat config. Formatting goes through `pnpm run fmt`; `pnpm run fmt:full` touches the entire tree. For comprehensive pre-release validation, execute `pnpm run check-all`.

## Coding Style & Naming Conventions

All sources are TypeScript ESM using the `.mts` extension; compiled output is `.mjs`. Modules favor named exports; defaults are reserved for `configs/**` and `scripts/**`. Imports omit extensions unless targeting `.mjs` or `.json`. Follow the repository’s Prettier setup with organize-imports and package.json plugins—avoid manual formatting. Indentation is two spaces for code (Markdown uses four).

## Testing Guidelines

Vitest powers the suite with strict type-checking. Co-locate tests as `*.test.mts` alongside the code or under `test/**`. Guard new rules with scenario-driven tests and include regression cases replicating reported bugs. Run `pnpm run test` locally before pushing; capture coverage deltas with `pnpm run test:cov` when altering critical rule logic.

## Commit & Pull Request Guidelines

Commits use Conventional Commit prefixes (`feat`, `fix`, `chore`, `docs`, `refactor`, etc.); declare breaking changes with the standard footer. Pull requests should describe purpose, highlight notable updates, link issues, and attach screenshots for docs changes. Ensure `pnpm run lint`, `pnpm run test`, and `pnpm run build` succeed before requesting review.

## Security & Configuration Tips

Develop against Node.js 18 or later (CI runs Node 25). Use `pnpm install --frozen-lockfile` for deterministic installs and store local secrets in `.env`, mirroring `.env.example`. Never commit generated credentials or tokens. Review GitHub automation scripts under `scripts/` before modifying workflow-sensitive tasks.
