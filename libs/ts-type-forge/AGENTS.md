# Repository Guidelines

## Project Structure & Module Organization

- `src/` — TypeScript type utilities organized by domain (e.g., `record/`, `tuple-and-list/`). Public entry is `src/index.d.mts` (auto‑generated; do not edit).
- `test/` — Compile‑time type tests using `expectType` helpers. Mirror the `src/` structure when adding tests.
- `docs/` — Handwritten docs and examples. Keep docs in sync with public APIs.
- `scripts/` — Build, validation, docs, and GitHub maintenance scripts (`.mts`/`.mjs`).
- `configs/` — Shared tsconfig and tool configs. Project settings live in `tsconfig.json`.

## Build, Test, and Development Commands

- `npm run check-all` — End‑to‑end validation: install, spell check, ext check, lint:fix, build, docs, format.
- `npm run build` — Generate `src/index.d.mts`, create index files, and run type checking.
- `npm run tsc` / `npm run tscw` — Type check once / in watch mode.
- `npm run lint` / `npm run lint:fix` — Lint code and auto‑fix issues.
- `npm run fmt` / `npm run fmt:full` — Format changed files / entire repo with Prettier.
- `npm run doc` — Regenerate markdown docs. `npm run doc:embed` embeds code samples.
- `npm run md` / `npm run cspell` — Markdown and spell checks.

## Coding Style & Naming Conventions

- Language: TypeScript ESM with `.mts`; declaration files use `.d.mts`.
- Exports: Prefer named exports in `src/` (no default exports per ESLint rules).
- Formatting: 2‑space indent, LF line endings, single quotes, semicolons (see `.editorconfig`, `.prettierrc`).
- Files/dirs: kebab‑case (e.g., `type-level-integer`, `utils-for-test.mts`).

## Testing Guidelines

- Use compile‑time assertions via `test/expect-type.mts` (e.g., `expectType<A, B>('=')`).
- Place tests under `test/<area>/...` matching the corresponding `src/` path.
- Run tests by type checking: `npm run tsc` or `npm run check-all`.
- Runtime tests are not configured; favor type‑level coverage and clear examples in `docs/`.

## Commit & Pull Request Guidelines

- Conventional Commits are required (semantic‑release). Examples:
    - `feat(record): add DeepRequired`
    - `fix(tuple-and-list): handle empty tuple`
    - `refactor!: simplify conditional types` with footer `BREAKING CHANGE: ...`
- PRs: include a clear description, link issues, update docs/tests, and ensure `npm run check-all` passes. Commit generated updates (e.g., `src/index.d.mts`, docs) when relevant.

## Security & Configuration

- GitHub maintenance scripts read `.env` (see `.env.example`). Keep tokens local and uncommitted. Example: `npm run gh:apply-all` uses `--env-file=.env`.
- Do not store secrets in source files or docs. Prefer environment variables and local config.
