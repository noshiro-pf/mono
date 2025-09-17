# Repository Guidelines

## Project Structure & Module Organization

- `src/` holds modular `.mts` sources; keep utilities small and re-export via `src/index.mts`. After adding modules, run `npm run gi` to refresh barrels.
- `test/` contains integration and exploratory specs; co-locate focused unit tests as `*.test.mts` beside implementations. Keep names descriptive and mirror the source folder layout.
- Generated assets live in `dist/`, `docs/`, `coverage/`, `samples/`, and `documents/`; never edit build outputs by hand. Shared tooling lives in `configs/`, while reusable scripts belong in `scripts/`.
- Use the repository root `README.md` and `documents/` for longer guides; update both when developer workflows change.

## Build, Test, and Development Commands

- `npm run build` compiles the ESM bundles into `dist/`.
- `npm test`, `npm run testw`, and `npm run test:ui` run Vitest once, in watch mode, or through the UI runner.
- `npm run lint`, `npm run lint:fix`, `npm run type-check`, and `npm run fmt` enforce style, static analysis, and formatting.
- `npm run check-all` executes the full local CI pipeline. Use `npm run doc` and `npm run doc:embed` when updating reference docs or samples.

## Coding Style & Naming Conventions

- TypeScript-only, ESM modules; prefer named exports, arrow functions, and hyphenated lowercase file names. Import extensions intentionally include `.mjs`.
- Adhere to two-space indentation, destructured imports, and the repository ESLint + Prettier rules. Avoid `as any`, `@ts-ignore`, or file-scope disable comments.
- Favor readonly parameter types for complex objects, and keep comments concise and purpose-driven.

## Testing Guidelines

- Vitest is the primary framework; use `test()` blocks with `.toStrictEqual()` assertions. Reach for `expectType<A, B>('=')` to verify compile-time contracts.
- Mirror source structure in test filenames, cover both happy paths and guard rails, and run `npm run test:cov` followed by `npm run test:cov:ui` to inspect coverage.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (e.g., `feat(parser): add combinator`, `fix(record): handle excess properties`). Mark breaking changes via `BREAKING CHANGE:` footers or the `scope: breaking` pattern.
- PRs must summarize rationale, link related issues, attach relevant screenshots, and confirm `npm run check-all` success. Do not bump versions; releases are automated.

## Workflow Tips

- Keep work on focused feature branches, rebase before opening a PR, and avoid touching `~/.ssh` or other sensitive paths.
- Network access is restricted; cache dependencies locally and surface any tooling gaps early so they can be addressed.
