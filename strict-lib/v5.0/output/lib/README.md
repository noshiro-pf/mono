# strict-ts-lib-v5.0

Strict rewrite of TypeScript 5.0.4's built-in
standard library declarations.

```sh
npm install -D strict-ts-lib-v5.0
```

Every built-in library ships inside this one package, in two flavors:

- `libs/` — plain `number`
- `libs-branded/` — branded number types (`Uint8`, `SafeUint`, …)

Pick one with `paths` in your `tsconfig.json`:

```jsonc
{
    "compilerOptions": {
        "libReplacement": true, // TypeScript 6.0 and later
        "paths": {
            "@typescript/lib-*": ["./node_modules/strict-ts-lib-v5.0/libs/*"],
        },
    },
}
```

Two things to watch, because both fail silently — the replacement simply
does not happen, with no error:

- **`paths` is replaced, not merged, by a config that `extends` another**,
  so it has to be written in whichever config TypeScript actually loads.
- **The path is relative to the config that contains it**, which in a
  monorepo package is usually `../../node_modules/…`.

See <https://github.com/noshiro-pf/strict-typescript-lib> for usage and version support.
