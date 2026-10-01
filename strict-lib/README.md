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
so choosing a flavor is choosing which directory TypeScript is pointed at:

| Directory       | Numbers                                                |
| :-------------- | :----------------------------------------------------- |
| `libs/`         | plain `number`                                         |
| `libs-branded/` | branded (`Uint8`, `SafeUint`, …), from `ts-type-forge` |

There are two ways to point it, and which are open depends on the version —
measured, package against its own TypeScript:

| TypeScript | Route              | `libReplacement`                           |
| :--------- | :----------------- | :----------------------------------------- |
| 5.0 – 5.7  | linker             | not a known option; setting it is an error |
| 5.8 – 5.9  | linker             | defaults to on                             |
| 6.x        | linker             | defaults to **off**; must be set to `true` |
| 7.x        | linker, or `paths` | defaults to **off**; must be set to `true` |

Each package's README gives the recipe for its own version. Every way of
getting it wrong fails **silently** — the replacement simply does not happen,
with no error and no warning — so check the result (below).

#### The linker, on every version

TypeScript resolves `@typescript/lib-*` as ordinary package names, through a
fixed Node10 lookup. Every bundle ships `link-libs.mjs` as a `bin` that
answers it: one symlink per lib group under the consumer's
`node_modules/@typescript/`, pointing back into the installed package.
Nothing else can, because reaching those directories through a dependency
means depending on a path inside `node_modules`, which pnpm refuses
(`ERR_PNPM_LINKED_PKG_DIR_NOT_FOUND`).

```sh
npx strict-ts-lib-v7.0-link             # plain `number`
npx strict-ts-lib-v7.0-link --branded   # branded
npx strict-ts-lib-v7.0-link --unlink    # undo
```

The command is named after the package (`strict-ts-lib-v6.0-link` for
`strict-ts-lib-v6.0`, and so on). Put it in your own `prepare` script so a
reinstall restores the links:

```jsonc
// package.json
{
    "scripts": {
        "prepare": "strict-ts-lib-v7.0-link",
    },
}
```

Then set `libReplacement` where the table above says to; nothing else goes in
`tsconfig.json`.

```jsonc
// tsconfig.json (TypeScript 6 and 7)
{
    "compilerOptions": {
        "libReplacement": true,
    },
}
```

One more trap, and it is version-specific: **TypeScript 5.0 resolves
`@typescript/lib-*` relative to the current directory**, not to the config
that asked for it. Running `tsc -p some/dir/tsconfig.json` from elsewhere
silently gets the stock library.

#### `paths`, on TypeScript 7 only

TypeScript 7 also reads `paths` for a lib replacement, so a project where
nothing runs an older TypeScript can skip the linker:

```jsonc
// tsconfig.json
{
    "compilerOptions": {
        "libReplacement": true,
        "paths": {
            "@typescript/lib-*": ["./node_modules/strict-ts-lib-v7.0/libs/*"],
            // …or "libs-branded/*" for the branded flavor
        },
    },
}
```

Three things to watch:

- **TypeScript 6 and earlier ignore it — and that includes your linter.**
  typescript-eslint needs the JavaScript compiler API, which TypeScript 7.0
  does not export, so it runs a 6.x `typescript` and sees the stock library
  while `tsc` sees the strict one. If anything type-aware runs on TypeScript 6,
  use the linker; `strict-ts-lib-v7.0` serves TypeScript 6 too, which is what
  its `peerDependencies` says.
- **`paths` is replaced, not merged, by a config that `extends` another.** A
  package whose own `tsconfig.json` sets `paths` for anything else needs this
  entry repeated there; putting it only in the shared base config is not
  enough.
- **The path is relative to the config that contains it.** From a package in a
  monorepo that is usually `../../node_modules/strict-ts-lib-v7.0/libs/*`.

#### Checking that it took effect

Compile something only the strict library rejects, in a file your
`tsconfig.json` includes — through the config, not with the file named on the
command line, which skips the config and `libReplacement` with it:

```sh
echo "export const n = parseInt('10', 1);" > src/probe.ts  # anywhere the config includes
npx tsc --noEmit   # strict lib: radix 1 is an error; stock lib: no error
```

`tsc --traceResolution` is the fuller check — every `@typescript/lib-*` lookup
it prints should end in `was successfully resolved`. Run the same probe
through your linter if it is type-aware: it may be on a different TypeScript.

### TypeScript version support

- **`>=5.0 <=7.0`** — Supported, one package per minor. Use the
  `strict-ts-lib-vX.Y` matching yours; the package's `peerDependencies` pins
  the range it was generated for, and mixing them does not work — the lib
  files reference each other by names that come and go between minors, so
  `strict-ts-lib-v5.6` under TypeScript 6 fails with `TS2727: Cannot find lib
definition for 'es2022.sharedmemory'`. The one exception is
  `strict-ts-lib-v7.0`, whose range also covers TypeScript 6 — through the
  linker, since TypeScript 6 ignores `paths`.
- **`<5.0`** — Not supported.
- **`>7.0`** — No matching version yet; use the closest published minor.

## License

[Apache License 2.0](../LICENSE), the same license as the TypeScript lib
files every package here is generated from (Copyright Microsoft Corporation).
Each generated file keeps the upstream copyright banner and states beneath it
that it was modified, and each published bundle ships `LICENSE` and a
`NOTICE` naming the upstream commit — which is what Apache-2.0 section 4 asks
of a derivative work.
