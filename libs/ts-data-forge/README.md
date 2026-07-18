# ts-data-forge monorepo

This repository is a [pnpm](https://pnpm.io/) monorepo. It currently contains the
`ts-data-forge` library.

| Package         | Path                     | Description                                                                 |
| --------------- | ------------------------ | --------------------------------------------------------------------------- |
| `ts-data-forge` | `packages/ts-data-forge` | Type-safe utility library for TypeScript (types, guards, functional tools). |

## Roadmap

The following packages are planned and not yet part of the repository:

- `eslint-plugin-ts-data-forge` — ESLint rules that steer code toward
  `ts-data-forge` idioms.
- `@ts-data-forge/docs` — documentation site (Astro + Starlight).

## Getting started

```sh
pnpm install
git submodule update --init --recursive

# Build every package (in dependency order)
pnpm run ws:build

# Run tests / type-check / lint across the workspace
pnpm run ws:test
pnpm run ws:type-check
pnpm run ws:lint
```

## Releasing

Releases are managed with [Changesets](https://github.com/changesets/changesets).
Add a changeset describing user-facing changes:

```sh
pnpm changeset
```

Merging the automatically opened **"chore: version packages"** PR versions the
affected packages, updates their changelogs, and publishes them to npm. Each
published package is tagged as `<package-name>@<version>` (e.g.
`ts-data-forge@10.1.0`).

## License

[Apache-2.0](./LICENSE)
