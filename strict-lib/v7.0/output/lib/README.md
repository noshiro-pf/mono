# strict-ts-lib-v7.0

Strict rewrite of TypeScript 7.0.2's built-in
standard library declarations.

```sh
npm install -D strict-ts-lib-v7.0
```

Every built-in library ships inside this one package, in two flavors:

- `libs/` — plain `number`
- `libs-branded/` — branded number types (`Uint8`, `SafeUint`, …)

TypeScript 7.0 looks a replacement up as `@typescript/lib-*`,
an ordinary package name. Run the linker this package ships to supply
those names. It creates one symlink per lib group under
`node_modules/@typescript/`:

```sh
npx strict-ts-lib-v7.0-link             # plain `number`
npx strict-ts-lib-v7.0-link --branded   # branded number types
```

Add it to your own `package.json` so that a reinstall restores the links:

```jsonc
{
    "scripts": {
        "prepare": "strict-ts-lib-v7.0-link",
    },
}
```

Then set `libReplacement` — it defaults to off from TypeScript 6, and
the lookup does not happen without it:

```jsonc
{
    "compilerOptions": {
        "libReplacement": true,
    },
}
```

`--unlink` removes the links again.

**Or, if nothing runs TypeScript 6, `paths`.** TypeScript 7 also reads
`paths` for this, so instead of linking you can point it at the flavor you
want:

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

Three things to watch, because all of them fail silently — the replacement
simply does not happen, with no error:

- **TypeScript 6 and earlier ignore it.** That includes your linter:
  typescript-eslint needs the JavaScript compiler API, which TypeScript 7.0
  does not export, so it runs a 6.x `typescript` and sees the stock library.
  Use the linker if anything type-aware runs on TypeScript 6.
- **`paths` is replaced, not merged, by a config that `extends` another**,
  so it has to be written in whichever config TypeScript actually loads.
- **The path is relative to the config that contains it**, which in a
  monorepo package is usually `../../node_modules/…`.

See <https://github.com/noshiro-pf/mono> for usage and version support.

## License

Apache-2.0, like the TypeScript lib files it is generated from
(Copyright Microsoft Corporation). `LICENSE` and `NOTICE` in this
package have the details.
