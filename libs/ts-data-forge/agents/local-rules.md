# ts-data-forge Local Rules & Guidelines

## Project Structure

- `src/`: ESM TypeScript modules (`.mts`), organized by domain (e.g., `array/`, `functional/`, `guard/`). Place tests as `*.test.mts` beside sources.
- `samples/`: Usage examples and sample tests.
- `configs/`: Build/test configs (Rollup, Vitest, tsconfig).
- `scripts/`: Automation scripts (`scripts/cmd/*.mts`).
- `dist/`: Generated ESM output and types (do not edit).
- `docs/`, `coverage/`: Generated documentation and reports.
- Node.js >= 20.11, ESM (`type: module`).

## Development Workflow

- Use provided npm scripts for all tasks:
    - `npm run check-all`: Full validation (install, spell-check, lint, test, build, docs, samples)
    - `npm run build`: Type-check, build with Rollup
    - `npm test`, `npm run testw`, `npm run test:ui`, `npm run test:cov`: Run tests
    - `npm run lint`, `npm run lint:fix`: ESLint
    - `npm run fmt`, `npm run fmt:full`: Prettier
    - `npm run tsc`, `npm run type-check:samples`: Type checking
    - `npm run doc`: Generate docs
- After adding modules, run `npm run gi` to refresh index files.
- Keep PRs small, focused, and within the module layout.

## Commit & PR Guidelines

- Use Conventional Commits (semantic-release). Example: `feat(array): add isNonEmpty`
- For breaking changes, follow `BREAKING_CHANGE_GUIDE.md` and add a `BREAKING CHANGE:` footer.
- PRs must have a clear description, linked issues, updated tests/docs, and pass `npm run check-all`.
- Do not commit generated `dist/` or `coverage/`.

## Architecture & Patterns

- **Type-first**: Heavy use of TypeScript types for safety
- **Zero runtime dependencies**: Only dev tooling
- **Functional programming**: Immutability, Option/Result types
- **ESM modules**: `.mts` with NodeNext
- **Type guards**: Prefer type guard functions over assertions
- **Export strategy**: All exports via generated index files
- **Documentation**: Auto-generated from TSDoc

## Code Style & Quality

- **NEVER** use `as any`, `as never`, or `@ts-ignore` (use `@ts-expect-error` only if necessary)
- **ALWAYS** use `.toStrictEqual()` in Vitest tests
- **ALWAYS** use `test()` instead of `it()` in Vitest
- **ALWAYS** use named exports unless restricted
- **ALWAYS** use arrow functions
- **PREFER** readonly parameter types and type-safe operations
- **PREFER** ES modules and destructured imports
- **PREFER** running single tests for performance
- **AVOID** file-scope `/* eslint-disable */` and unnecessary `// eslint-disable-next-line`
- **RESTRICTIONS**: Never push to remotes or access sensitive directories without explicit instruction

## Testing Approach

- Use Vitest for both compile-time (`expectType`) and runtime assertions
- Co-locate tests with sources as `.test.mts`
- Example:

    ```typescript
    import { expectType } from '../expect-type.mjs';
    expectType<typeof result, readonly [0, 0, 0]>('=');
    assert.deepStrictEqual(result, [0, 0, 0]);
    ```

## TDD Workflow

1. Write tests first
2. Confirm test failure
3. Implement minimal code to pass
4. Refactor with tests green
5. Repeat for new functionality

## Script Organization

- In `scripts/`, order functions by call hierarchy: main → direct callees → helpers → types/constants

## Checklist Before Commit

- [ ] `npm run tsc` (type check)
- [ ] `npm run test` (all tests)
- [ ] `npm run lint` (ESLint)
- [ ] `npm run fmt` (format)
- [ ] `npm run build` (build)
