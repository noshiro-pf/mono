# Repository Guidelines

## Project Structure & Module Organization

- `src/` Type-safe ESLint config source: `configs/`, `plugins/`, `rules/`, `types/`, `custom-rules/` (TypeScript ESM, `.mts`).
- `configs/` Build/test configs: `rollup.config.ts`, `vitest.config.ts`, `tsconfig/*`, `typedoc.config.mjs`.
- `scripts/` Utilities and CLI tasks under `cmd/` plus GitHub automation.
- `docs/` Package docs (generated and hand-written). `dist/` is build output (do not edit).

## Build, Test, and Development Commands

- `npm run build` Full build via Rollup; cleans `dist/`, type-checks, generates indexes.
- `npm run test` Run Vitest (type-check enabled). `testw` watch, `test:ui` UI, `test:cov` coverage.
- `npm run lint` / `lint:fix` Lint repo using this package’s flat config.
- `npm run fmt` Format changed files; `fmt:full` formats all.
- `npm run check-all` End-to-end: install, spellcheck, tests, lint, build, docs, format.
- `npm run doc` Generate docs; `doc:embed` embeds sample snippets.

## Coding Style & Naming Conventions

- Language: TypeScript ESM. Use `.mts` for source; compiled files are `.mjs`.
- Indentation: 2 spaces (Markdown uses 4) via `.editorconfig`.
- Formatting: Prettier (+ organize-imports, package.json plugin). Do not hand-format.
- Exports: Prefer named exports; default exports are generally forbidden (`import/no-default-export`). Allowed in `scripts/**` and `configs/**` only.
- Imports: Extensions are usually omitted except `*.mjs`/`*.json` (see `import/extensions`).
- Index files are generated (`npm run gi`); don’t edit generated indexes by hand.

## Testing Guidelines

- Framework: Vitest with type-checking (`configs/vitest.config.ts`).
- Location: co-locate as `**/*.test.mts` or under `test/**`.
- Run: `npm run test`; coverage: `npm run test:cov` and preview HTML via `npm run test:cov:ui`.

## Commit & Pull Request Guidelines

- Use Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, etc.). For majors, follow BREAKING CHANGE footer rules (see `BREAKING_CHANGE_GUIDE.md`).
- PR titles must be conventional; CI validates titles.
- PRs should include: purpose, highlights of changes, linked issues, and any screenshots for docs.
- Ensure `lint`, `test`, and `build` pass before requesting review.

## Security & Configuration Tips

- Node 18+ (CI uses Node 20). Use `npm ci` for reproducible installs.
- Never commit secrets. GitHub automation reads variables from `.env` (see `.env.example`).
