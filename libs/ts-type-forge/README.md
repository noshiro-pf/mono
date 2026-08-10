# ts-type-forge monorepo

This repository is a pnpm workspace containing the `ts-type-forge` type-level
utility library and its companion ESLint plugin.

| Package                                                                          | npm                                                                                        | Description                                                                                      |
| :------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| [`packages/ts-type-forge`](./packages/ts-type-forge)                             | [`ts-type-forge`](https://www.npmjs.com/package/ts-type-forge)                             | A collection of advanced TypeScript type utilities (types only — no runtime code).               |
| [`packages/eslint-plugin-ts-type-forge`](./packages/eslint-plugin-ts-type-forge) | [`eslint-plugin-ts-type-forge`](https://www.npmjs.com/package/eslint-plugin-ts-type-forge) | ESLint rules that steer type declarations toward ts-type-forge idioms (e.g. `NonEmptyArray<V>`). |

## Getting started

```sh
pnpm install
pnpm run ws:build
```

## Repository-wide scripts

| Script                 | Description                                                                   |
| :--------------------- | :---------------------------------------------------------------------------- |
| `pnpm run ws:build`    | Build every package in dependency order (`ws:build:min` skips the checks).    |
| `pnpm run ws:test`     | Run each package's tests (type-level for the library, Vitest for the plugin). |
| `pnpm run ws:lint:fix` | Run ESLint with `--fix` in every package.                                     |
| `pnpm run ws:doc`      | Regenerate the TypeDoc output and the embedded samples.                       |
| `pnpm run check:root`  | Type-check and lint the repository-level `scripts/` and `configs/`.           |
| `pnpm run check-all`   | Everything above, plus spellcheck, markdown lint, codemod and formatting.     |
| `pnpm changeset`       | Record a release note for the packages you changed.                           |

Releases are driven by [Changesets](https://github.com/changesets/changesets):
merging a PR that contains a changeset opens (or updates) a "version packages"
pull request, and merging that publishes to npm.

## License

[Apache-2.0](./LICENSE)
