# strict-ts-lib-v5.7

Strict rewrite of TypeScript 5.7.2's built-in
standard library declarations.

```sh
npm install -D strict-ts-lib-v5.7
```

Every built-in library ships inside this one package, in two flavors:

- `libs/` — plain `number`
- `libs-branded/` — branded number types (`Uint8`, `SafeUint`, …)

TypeScript 5.7 resolves `@typescript/lib-*` as ordinary
package names, through a fixed Node10 lookup — it does not read `paths`
for this. Run the linker this package ships to supply those names. It
creates one symlink per lib group under `node_modules/@typescript/`:

```sh
npx strict-ts-lib-v5.7-link             # plain `number`
npx strict-ts-lib-v5.7-link --branded   # branded number types
```

Add it to your own `package.json` so that a reinstall restores the links:

```jsonc
{
    "scripts": {
        "prepare": "strict-ts-lib-v5.7-link",
    },
}
```

Nothing goes in `tsconfig.json`: the lookup is unconditional at
TypeScript 5.7, where `libReplacement` is not yet a known
option — setting it is an error.

`--unlink` removes the links again.

See <https://github.com/noshiro-pf/mono> for usage and version support.
