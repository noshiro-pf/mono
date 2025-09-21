# Repository Guidelines

## Project Structure & Module Organization

The ESLint config source sits in `src/`, organized by responsibility: `configs/` for build and test presets, `plugins/` and `rules/` for exported rule collections, `types/` for shared TypeScript declarations, and `custom-rules/` for repository-only rules. Utility scripts live in `scripts/`, with CLI helpers under `scripts/cmd/`. Configuration inputs (Rollup, Vitest, Typedoc, tsconfig variants) are in `configs/`. Generated artifacts land in `dist/`—never edit that directory directly.

## Build, Test, and Development Commands

Run `npm run build` for the full pipeline: cleans `dist/`, type-checks, bundles, and regenerates indexes. Use `npm run test` for Vitest with type-checking; switch to `npm run testw` for watch mode or `npm run test:cov` for coverage plus `npm run test:cov:ui` to inspect reports. `npm run lint` (or `npm run lint:fix`) validates the flat config. Formatting goes through `npm run fmt`; `npm run fmt:full` touches the entire tree. For comprehensive pre-release validation, execute `npm run check-all`.

## Coding Style & Naming Conventions

All sources are TypeScript ESM using the `.mts` extension; compiled output is `.mjs`. Modules favor named exports; defaults are reserved for `configs/**` and `scripts/**`. Imports omit extensions unless targeting `.mjs` or `.json`. Follow the repository’s Prettier setup with organize-imports and package.json plugins—avoid manual formatting. Indentation is two spaces for code (Markdown uses four).

## Testing Guidelines

Vitest powers the suite with strict type-checking. Co-locate tests as `*.test.mts` alongside the code or under `test/**`. Guard new rules with scenario-driven tests and include regression cases replicating reported bugs. Run `npm run test` locally before pushing; capture coverage deltas with `npm run test:cov` when altering critical rule logic.

## Commit & Pull Request Guidelines

Commits use Conventional Commit prefixes (`feat`, `fix`, `chore`, `docs`, `refactor`, etc.); declare breaking changes with the standard footer. Pull requests should describe purpose, highlight notable updates, link issues, and attach screenshots for docs changes. Ensure `npm run lint`, `npm run test`, and `npm run build` succeed before requesting review.

## Security & Configuration Tips

Develop against Node.js 18 or later (CI runs Node 20). Use `npm ci` for deterministic installs and store local secrets in `.env`, mirroring `.env.example`. Never commit generated credentials or tokens. Review GitHub automation scripts under `scripts/` before modifying workflow-sensitive tasks.
