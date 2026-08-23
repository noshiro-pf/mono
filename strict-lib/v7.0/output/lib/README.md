# strict-ts-lib-v7.0

Strict rewrite of TypeScript 7.0.2's built-in
standard library declarations.

```sh
npm install -D strict-ts-lib-v7.0
```

Every built-in library ships inside this one package, in two flavors:

- `libs/` — plain `number`
- `libs-branded/` — branded number types (`Uint8`, `SafeUint`, …)

Pick one with `paths` in your `tsconfig.json`:

```jsonc
{
    "compilerOptions": {
        "libReplacement": true,
        "paths": {
            "@typescript/lib-*": ["./node_modules/strict-ts-lib-v7.0/libs/*"],
        },
    },
}
```

**This needs TypeScript 7.** TypeScript 6 and earlier resolve a lib
replacement by looking `@typescript/lib-*` up as ordinary package names —
a fixed Node10 lookup that ignores `paths` — which a single package
shipping every lib as a subdirectory cannot answer. On those versions the
replacement does not happen.

Three things to watch, because all of them fail silently — the
replacement simply does not happen, with no error:

- **`paths` is replaced, not merged, by a config that `extends` another**,
  so it has to be written in whichever config TypeScript actually loads.
- **The path is relative to the config that contains it**, which in a
  monorepo package is usually `../../node_modules/…`.
- **`libReplacement` is a no-op on TypeScript 6 and earlier here**, per
  the note above.

See <https://github.com/noshiro-pf/mono> for usage and version support.
