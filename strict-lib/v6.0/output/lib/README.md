# strict-ts-lib-v6.0

Strict rewrite of TypeScript 6.0.3's built-in
standard library declarations.

```sh
npm install -D strict-ts-lib-v6.0
```

Every built-in library ships inside this one package, in two flavors:

- `libs/` — plain `number`
- `libs-branded/` — branded number types (`Uint8`, `SafeUint`, …)

TypeScript 6.0 resolves `@typescript/lib-*` as ordinary
package names, through a fixed Node10 lookup — it does not read `paths`
for this. Run the linker this package ships to supply those names. It
creates one symlink per lib group under `node_modules/@typescript/`:

```sh
npx strict-ts-lib-v6.0-link             # plain `number`
npx strict-ts-lib-v6.0-link --branded   # branded number types
```

Add it to your own `package.json` so that a reinstall restores the links:

```jsonc
{
    "scripts": {
        "prepare": "strict-ts-lib-v6.0-link",
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

See <https://github.com/noshiro-pf/mono> for usage and version support.
