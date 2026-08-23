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

Three things to watch, because all of them fail **silently** — the replacement
simply does not happen, with no error and no warning:

- **`paths` is replaced, not merged, by a config that `extends` another.** A
  package whose own `tsconfig.json` sets `paths` for anything else needs this
  entry repeated there; putting it only in the shared base config is not
  enough.
- **The path is relative to the config that contains it.** From a package in a
  monorepo that is usually `../../node_modules/strict-ts-lib-v7.0/libs/*`.
- **Only TypeScript 7 reads `paths` for a lib replacement.** TypeScript 6 and
  earlier resolve `@typescript/lib-*` as ordinary package names, through a
  fixed Node10 lookup that ignores `paths` — see the version note below.

To confirm it took effect, compile something that only the strict library
rejects:

```sh
echo "export const n = parseInt('10', 1);" > probe.ts
npx tsc --noEmit probe.ts   # strict lib: radix 1 is an error; stock lib: no error
```

`tsc --traceResolution` is the fuller check — every `@typescript/lib-*` lookup
it prints should end in `was successfully resolved`.

### TypeScript version support

- **`7.0`** — Supported. `strict-ts-lib-v7.0` on npm, wired up with the `paths`
  entry above; `libReplacement` no longer defaults to on, so it has to be set
  explicitly and the `paths` entry does nothing without it.
- **`>=5.0 <7.0`** — Generated here, one package per minor, and type-checked
  against its own pinned TypeScript — but **not consumable from npm as it
  stands**. Those TypeScript versions look `@typescript/lib-*` up by name
  rather than through `paths`, and one package shipping every lib as a
  subdirectory has no name for them to find. What would answer that lookup is a
  package per lib group per minor — 16 or so names each — which is the layout
  this repository moved away from. Until there is a route that does not
  reintroduce it, treat those versions as source rather than as releases.
- **`<5.0`** — Not supported.
- **`>7.0`** — No matching version yet; use the closest published minor.

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
