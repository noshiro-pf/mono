# Repository Guidelines

## Project Structure & Module Organization

- `src/` holds type utilities grouped by domain (`record/`, `tuple-and-list/`, etc.). Export surface is auto-generated to `src/index.d.mts`; never edit it directly.
- `test/` mirrors the `src/` tree. Add compile-time tests beside the matching module (e.g., `src/tuple-and-list/...` -> `test/tuple-and-list/...`).
- `docs/` contains hand-written guides and examples. Update docs when public APIs change.
- Support folders: `scripts/` for maintenance scripts, `configs/` for shared tsconfigs and linters, and root configs (`package.json`, `tsconfig.json`) for project settings.

## Build, Test, and Development Commands

- `npm run build` regenerates declaration bundles and verifies types.
- `npm run tsc` performs a one-off type check; use `npm run tscw` for watch mode.
- `npm run lint` and `npm run lint:fix` enforce ESLint rules; `npm run fmt` formats staged files.
- `npm run check-all` runs the full CI parity pipeline (install, lint:fix, build, docs, format, spelling). Use before opening a PR.
- `npm run doc` refreshes Markdown docs; pair with `npm run doc:embed` to sync code snippets.

## Coding Style & Naming Conventions

- TypeScript ESM (`.mts`) and declaration files (`.d.mts`) only; no default exports.
- Follow 2-space indents, LF endings, single quotes, and semicolons (`.editorconfig`, `.prettierrc`).
- Prefer kebab-case for files and directories (`type-level-integer`, `utils-for-test.mts`).
- Run `npm run fmt:full` after bulk edits to normalize formatting.

## Testing Guidelines

- Use compile-time assertions from `test/expect-type.mts`: `expectType<A, B>('=')`.
- Structure test files to mirror module paths and cover edge cases (empty tuples, deep nesting, etc.).
- `npm run tsc` doubles as the test runner; ensure it passes before commits.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`feat(record): add DeepRequired`, `fix(tuple-and-list): handle empty tuple`). Mark breaking changes with `refactor!` and a `BREAKING CHANGE` footer.
- PRs should describe intent, link related issues, list manual validation, and include regenerated artifacts (`src/index.d.mts`, docs) when applicable.
- Verify `npm run check-all` locally and attach any relevant screenshots or code snippets to clarify behavior changes.

## Security & Configuration Tips

- Scripts may load `.env` (see `.env.example`). Keep real tokens local and out of source control.
- Avoid embedding secrets in docs or comments; reference environment variables instead.
- When using `npm run gh:*` scripts, pass `--env-file=.env` to limit token exposure.
