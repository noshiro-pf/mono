# strict-lib

A strict rewrite of TypeScript's built-in standard library declarations, one
package per TypeScript minor.

This lived in its own repository (`noshiro-pf/strict-typescript-lib`) until
2026-08. It moved here once npm became its only distribution channel, which is
what the separate repository had existed to work around — see
[docs/strict-typescript-lib-integration.md](../docs/strict-typescript-lib-integration.md).

## Usage

This project ships a **strict** rewrite of TypeScript's built-in library
declarations (`lib.es5.d.ts`, `lib.dom.d.ts`, …), one set per TypeScript minor
version. Every built-in library lives inside **one package**, so one dependency
and one `paths` entry is the whole setup, on any package manager.

Each TypeScript minor has its own package — `strict-ts-lib-v7.0` for TypeScript
7.0, `strict-ts-lib-v5.9` for 5.9, and so on. **All minors share one version
number**, so `strict-ts-lib-v7.1@0.5.0` and `strict-ts-lib-v7.0@0.5.0` are the
same generation of the library.

### 1. Install the package

```sh
npm install -D strict-ts-lib-v7.0     # pnpm add -D / yarn add -D work the same
```

npm is the only channel. It is a single **direct** dependency, which every
package manager accepts without configuration. (pnpm rejects URL dependencies
only when a _dependency of a dependency_ uses one — which is what an earlier
layout, one package per lib behind an umbrella, ran into.)

### 2. Point TypeScript at the libs

The package carries **both flavors**, named the way TypeScript asks for them,
so one wildcard covers all of them — and choosing a flavor is choosing which
directory that wildcard points at:

| Directory       | Numbers                                                |
| :-------------- | :----------------------------------------------------- |
| `libs/`         | plain `number`                                         |
| `libs-branded/` | branded (`Uint8`, `SafeUint`, …), from `ts-type-forge` |

```jsonc
// tsconfig.json
{
    "compilerOptions": {
        "libReplacement": true, // see the version note below
        "paths": {
            "@typescript/lib-*": ["./node_modules/strict-ts-lib-v7.0/libs/*"],
            // …or "libs-branded/*" for the branded flavor
        },
    },
}
```

That recipe is for **TypeScript 7**, which is the only version that reads
`paths` for a lib replacement. Three things to watch, because all of them fail
**silently** — the replacement simply does not happen, with no error and no
warning:

- **`paths` is replaced, not merged, by a config that `extends` another.** A
  package whose own `tsconfig.json` sets `paths` for anything else needs this
  entry repeated there; putting it only in the shared base config is not
  enough.
- **The path is relative to the config that contains it.** From a package in a
  monorepo that is usually `../../node_modules/strict-ts-lib-v7.0/libs/*`.
- **TypeScript 6 and earlier ignore it.** They resolve `@typescript/lib-*` as
  ordinary package names, through a fixed Node10 lookup — see the version
  table below.

### TypeScript 6 and earlier: the linker

Every bundle ships `link-libs.mjs` as a `bin`, which creates one symlink per
lib group under the consumer's `node_modules/@typescript/`, pointing back into
the installed package. That is what answers the name lookup; nothing else can,
because reaching those directories through a dependency means depending on a
path inside `node_modules`, which pnpm refuses
(`ERR_PNPM_LINKED_PKG_DIR_NOT_FOUND`).

```sh
npx strict-ts-lib-v6.0-link             # plain `number`
npx strict-ts-lib-v6.0-link --branded   # branded
npx strict-ts-lib-v6.0-link --unlink    # undo
```

Consumers put it in their own `prepare` script so a reinstall restores the
links. Whether `libReplacement` also has to be set depends on the version;
each package's README says which, and this is the whole table, measured
package against its own TypeScript:

| TypeScript | Route   | `libReplacement`                           |
| :--------- | :------ | :----------------------------------------- |
| 5.0 – 5.7  | linker  | not a known option; setting it is an error |
| 5.8 – 5.9  | linker  | defaults to on                             |
| 6.x        | linker  | defaults to **off**; must be set to `true` |
| 7.x        | `paths` | defaults to **off**; must be set to `true` |

One more trap, and it is version-specific: **TypeScript 5.0 resolves
`@typescript/lib-*` relative to the current directory**, not to the config
that asked for it. Running `tsc -p some/dir/tsconfig.json` from elsewhere
silently gets the stock library.

To confirm it took effect, compile something that only the strict library
rejects:

```sh
echo "export const n = parseInt('10', 1);" > probe.ts
npx tsc --noEmit probe.ts   # strict lib: radix 1 is an error; stock lib: no error
```

`tsc --traceResolution` is the fuller check — every `@typescript/lib-*` lookup
it prints should end in `was successfully resolved`.

### TypeScript version support

- **`>=5.0 <=7.0`** — Supported, one package per minor. Use the
  `strict-ts-lib-vX.Y` matching yours; the package's `peerDependencies` pins
  the range it was generated for, and mixing them does not work — the lib
  files reference each other by names that come and go between minors, so
  `strict-ts-lib-v5.6` under TypeScript 6 fails with `TS2727: Cannot find lib
definition for 'es2022.sharedmemory'`.
- **`<5.0`** — Not supported.
- **`>7.0`** — No matching version yet; use the closest published minor.

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
