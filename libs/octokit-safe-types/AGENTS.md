# Repository Guidelines

## Project Structure & Module Organization

- Source: `src/` (ESM, TypeScript `.mts`). Barrel files live at `index.mts` per folder.
- Build output: `dist/` (`.mjs` runtime + `.d.mts` types, sourcemaps).
- Config: `configs/` (TS configs, Vitest config), root linters: `eslint.config.js`, `.prettierrc`.
- Scripts: `scripts/` (Node ESM `.mts` utilities, GitHub ruleset tools), backups in `branch-protection-rules/`.

## Build, Test, and Development Commands

- `npm run build` — builds to `dist/` via scripts in `scripts/cmd/`.
- `npm test` — run Vitest once. `npm run testw` for watch, `npm run test:ui` for UI.
- `npm run test:cov` — generate coverage; view with `npm run test:cov:ui` then open preview.
- `npm run type-check` — strict TS type-check (no emit).
- `npm run lint` / `lint:fix` — ESLint check/fix.
- `npm run fmt` — format changed files; `fmt:full` for repo-wide format.
- `npm run cspell` / `npm run md` — spellcheck and Markdown lint.
- `npm run check-all` — run all quality gates.

## Coding Style & Naming Conventions

- Indentation: 2 spaces (Markdown uses 4). LF line endings.
- Language: TypeScript (strict), ESM only. Prefer named exports; use `.mts` for sources.
- Filenames: kebab-case (e.g., `create-ruleset-request.mts`).
- Prettier governs formatting; ESLint rules include `unicorn`, `functional`, `import`, `promise`.
- Prefer readonly/immutable types and small, pure utilities consistent with the library’s intent.

## Testing Guidelines

- Framework: Vitest (see `configs/vitest.config.ts`). Test targets `src/**/*.mts` and `test/**/*.mts`.
- Place additional tests under `test/` mirroring `src/` paths. Name with clear intent.
- Run `npm test` locally; aim for meaningful coverage on validators and type-level behavior.

## Commit & Pull Request Guidelines

- Conventional Commits required (semantic-release). Use types like `feat`, `fix`, `chore`, `refactor`.
- Breaking changes must follow the exact format; see `BREAKING_CHANGE_GUIDE.md`.
- PRs: include a concise description, linked issues, rationale, and before/after notes when applicable. Keep diffs focused.

## Security & Configuration Tips

- Node `>=20.11.0`. Install with `npm ci`.
- GitHub ruleset scripts require `.env` with `PERSONAL_ACCESS_TOKEN`. Do not commit `.env`; see `.env.example`.

## Agent-Specific Instructions

- Follow this file’s scope repo-wide. Keep changes minimal, style‑consistent, and avoid altering release or publish configs. When uncertain, open a draft PR for discussion.
