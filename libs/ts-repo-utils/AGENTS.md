# Repository Guidelines

## Project Structure & Module Organization

- `src/` — Library source in strict ESM (`.mts`). CLI entry points in `src/cmd/`. Tests are co‑located as `*.test.mts`.
- `scripts/` — Build/validation and GitHub automation scripts.
- `configs/` — Rollup/Vitest/TS configs; build emits to `dist/`.
- `docs/` — Generated API docs; `samples/` — usage examples.
- `dist/` — Compiled output (generated). Do not edit.

## Build, Test, and Development Commands

- `npm run build` — Full build: validate, generate indexes, type‑check, rollup bundle.
- `npm test` / `npm run testw` — Run tests once / in watch mode.
- `npm run test:cov` — Run tests with coverage; `npm run test:cov:ui` to preview HTML.
- `npm run tsc` — Type‑check only. `npm run lint` / `lint:fix` — ESLint check/fix.
- `npm run fmt` — Format changed files; `fmt:diff` from `origin/main`; `fmt:full` formats all.
- `npm run doc` — Generate TypeDoc. `npm run check-all` — End‑to‑end validate (lint, test, build, docs, backups).

## Coding Style & Naming Conventions

- TypeScript ESM only; use `.mts` (exports compiled to `.mjs`).
- Indent 2 spaces; LF endings; single quotes; semicolons (see `.editorconfig`, `.prettierrc`).
- Prefer named exports and arrow functions. Avoid `any` and unsafe casts.
- Tools: Prettier (with organize‑imports), ESLint (eslint-config-typed), Markdownlint.

## Testing Guidelines

- Framework: Vitest (globals enabled); type‑checking via Vitest + TS config.
- File naming: co‑locate tests as `*.test.mts` next to sources.
- Conventions: use `test(...)` not `it(...)`, and `toStrictEqual(...)` for deep equality.
- Run: `npm test` or a single file `npm test -- src/functions/foo.test.mts`.

## Commit & Pull Request Guidelines

- Conventional Commits drive releases (semantic‑release). Examples:
    - `feat: add workspace stage runner`
    - `fix(exec): handle non‑zero exit codes`
    - Include `BREAKING CHANGE: ...` in body for majors (see `BREAKING_CHANGE_GUIDE.md`).
- Before opening a PR: run `npm run check-all` and ensure no `git` diff (`npm run fmt` + `npm exec -- assert-repo-is-clean`).
- PRs should include: clear description, linked issues, and for CLI changes, an example command/output.

## Security & Configuration Tips

- GitHub automation requires `.env` with `PERSONAL_ACCESS_TOKEN` (see `.env.example`). Never commit secrets.
- Do not edit generated artifacts in `dist/` or `docs/`; change sources and rebuild.
