# Repository Guidelines

## Project Structure & Module Organization

- Keep all TypeScript sources in `src/` using focused `.mts` modules; re-export shared helpers through `src/index.mts` and rerun `npm run gi` after adding modules.
- Place integration and exploratory specs in `test/`; co-locate tight unit specs as `*.test.mts` beside their implementations and mirror folder names.
- Treat `dist/`, `docs/`, `coverage/`, `samples/`, and `documents/` as generated outputs; never hand-edit build artifacts.
- Centralize shared tooling in `configs/` and reusable automation in `scripts/` to keep the project root tidy.

## Build, Test, and Development Commands

- `npm run build` compiles the ESM bundles into `dist/` for publishing and docs.
- `npm test`, `npm run testw`, and `npm run test:ui` execute Vitest once, in watch mode, or via the UI runner.
- `npm run lint`, `npm run lint:fix`, `npm run type-check`, and `npm run fmt` enforce linting, typing, and formatting standards.
- `npm run check-all` runs the local CI chain; use `npm run doc` and `npm run doc:embed` when refreshing documentation assets.

## Coding Style & Naming Conventions

- Write modern TypeScript ESM with named exports, arrow functions, and kebab-case filenames ending in `.mjs` for imports.
- Apply two-space indentation, prefer destructured imports, and keep comments short and focused.
- Avoid `as any`, `@ts-ignore`, or blanket disable directives; rely on the configured ESLint and Prettier rules.

## Testing Guidelines

- Standardize on Vitest with `test()` blocks and `.toStrictEqual()` assertions to lock behavior.
- Maintain test names that describe intent, cover both success paths and guard rails, and mirror source layout.
- For coverage reviews, run `npm run test:cov` followed by `npm run test:cov:ui`.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (e.g., `feat(parser): add combinator`, `fix(record): handle excess properties`) and flag breaking changes with a `BREAKING CHANGE:` footer or `scope: breaking` tag.
- PRs should explain rationale, link issues, attach relevant screenshots, and confirm `npm run check-all` passed; never bump versions manually.

## Workflow & Tooling Tips

- Branch per feature, rebase before opening a PR, and avoid modifying user-level config like `~/.ssh`.
- Network access is restricted; surface dependency or tooling gaps early so maintainers can assist.
