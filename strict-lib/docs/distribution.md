# Distribution (one package per TypeScript version)

This repository distributes its generated declarations as **one package per
TypeScript version**, published to the **npm registry**. Both number flavors
live inside it:

| Directory | Numbers |
| :-------- | :------ |
| `libs/` | plain `number` |
| `libs-branded/` | branded (`Uint8`, `SafeUint`, …), from `ts-type-forge` |

## Why one package

It used to be one package per lib file (~107 per flavor, ~214 per version),
then one per flavor (~24 in all). Both splits cost more than they bought.

Nobody installs a single built-in library: `libReplacement` loads the whole
closure of whatever `lib` is set to, so a consumer who wants `es2020` needs
`es5`, `es2015`, … as well. The per-lib split therefore never matched how the
declarations are used, and each name carried a first publish and a
trusted-publisher setup of its own — work that recurs for every new TypeScript
minor.

Merging the flavors removed the last of that. A consumer has to write a `paths`
entry regardless, so pointing it at `libs/` or `libs-branded/` costs nothing,
while halving the package count halves the per-minor setup.

## The layout on disk is the layout that ships

`packages/vX.Y/output/lib` **is** the package: `package.json`, `README.md`,
`libs/` and `libs-branded/`. `npm pack` runs against that directory and nothing
is rearranged.

That is a requirement, not tidiness. A consuming repository points `paths` at
`node_modules/<pkg>/libs/*`; when it vendors this repository as a workspace,
that path resolves through a symlink to this very directory. A layout assembled
at pack time would exist only inside the tarball, and the workspace consumer
would find nothing.

### What the tarball excludes

The per-group `package.json` files under `libs/` are **not** published
(`files` carries `!libs/**/package.json`).

They exist so this repository's own harnesses can resolve
`@typescript/lib-<group>` **by name** out of `node_modules`, which each
harness arranges with `file:output/lib/libs/<group>` in its
`devDependencies`. That is the only way TypeScript 6 and earlier find a
replacement: their lib resolution is a fixed Node10 lookup that ignores
`paths`. A consumer installing the tarball cannot use them anyway — it would
mean pointing a `file:` dependency inside `node_modules`.

## Versioning

**Every TypeScript minor shares one version number.** `strict-ts-lib-v7.1` and
`strict-ts-lib-v7.0` at the same version are the same generation of the
library, so upgrading TypeScript does not leave you guessing which version of
the strict library matches.

The version lives in each harness's `packages/vX.Y/package.json` and is copied
into the generated manifest; changesets moves them together.

## Publishing

`pnpm run dist:npm-publish` packs and publishes.

| Flag | Effect |
| :--- | :----- |
| _(none)_ | dry run — packs and reports, publishes nothing |
| `--publish` | actually publish |
| `--version=<range>` | limit to some minors (`5`, `5.9`, `>=5.7`) |
| `--tag=<dist-tag>` | publish under a dist-tag instead of `latest` |
| `--otp=<code>` | pass a 2FA code (needed when publishing by hand) |
| `--pack-only [--out-dir=<dir>]` | write tarballs and stop |

A version already on the registry is skipped, so the release workflow can run
it on every push to `main` and do nothing most of the time.

In CI, publishing is authenticated by **OIDC against the trusted publisher**
configured per package on npm — there is no token. A package's first publish
cannot work that way, because the trusted publisher can only be configured for
a package that already exists; see [first-release.md](./first-release.md).

## Consuming

See the root `README.md`. In short: install the package, then map the libs in
`tsconfig.json`.

```jsonc
{
    "compilerOptions": {
        "libReplacement": true, // TypeScript 6.0 and later
        "paths": {
            "@typescript/lib-*": ["./node_modules/strict-ts-lib-v7.0/libs/*"],
        },
    },
}
```

`paths` is replaced, not merged, by a config that `extends` another, and a
missing entry disables the replacement with no diagnostic at all. Verify with a
declaration only the strict library rejects (`Number.isFinite('1')`), or with
`tsc --traceResolution`.

## Notes

- **`ts-type-forge`** is resolved from the public npm registry and is declared
  once by each package on behalf of every declaration inside it.
- **GitHub Release tarballs are gone.** They existed because npm rate-limited
  the ~2,400 publishes the per-lib layout needed; with 12 packages that
  constraint is gone, and npm is the only channel.
