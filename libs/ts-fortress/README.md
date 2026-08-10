# ts-fortress monorepo

This repository is a pnpm workspace containing the `ts-fortress` schema
validation library and its companion ESLint plugin.

| Package                                                                      | npm                                                                                    | Description                                                            |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| [`packages/ts-fortress`](./packages/ts-fortress)                             | [`ts-fortress`](https://www.npmjs.com/package/ts-fortress)                             | TypeScript-first schema validation library with static type inference. |
| [`packages/eslint-plugin-ts-fortress`](./packages/eslint-plugin-ts-fortress) | [`eslint-plugin-ts-fortress`](https://www.npmjs.com/package/eslint-plugin-ts-fortress) | ESLint rules that steer schema definitions toward ts-fortress idioms.  |

## Getting started

```sh
pnpm install
pnpm run ws:build
```

## Repository-wide scripts

| Script                 | Description                                                                                              |
| :--------------------- | :------------------------------------------------------------------------------------------------------- |
| `pnpm run ws:build`    | Build every package in dependency order (`ws:build:min` skips the checks).                               |
| `pnpm run ws:test`     | Run each package's Vitest suite (`ws:test:cov` for coverage, `ws:test:browser` for the browser project). |
| `pnpm run ws:lint:fix` | Run ESLint with `--fix` in every package.                                                                |
| `pnpm run ws:doc`      | Regenerate the TypeDoc output and the embedded samples.                                                  |
| `pnpm run check:root`  | Type-check and lint the repository-level `scripts/` and `configs/`.                                      |
| `pnpm run check-all`   | Everything above, plus spellcheck, markdown lint, codemod and formatting.                                |
| `pnpm changeset`       | Record a release note for the packages you changed.                                                      |

Releases are driven by [Changesets](https://github.com/changesets/changesets):
merging a PR that contains a changeset opens (or updates) a "version packages"
pull request, and merging that publishes to npm.

## License

[Apache-2.0](./LICENSE)
