# Next major

## Undecided

- Stop resolving `baseUrl`-relative `paths` in `strict-dependencies`.

    The rule reads `baseUrl` so that legacy `paths` entries resolve as `tsc`
    resolves them, although `baseUrl` is deprecated in TypeScript 6.0. Write
    `paths` relative to the `tsconfig.json` instead. This goes with a change
    to the `typescript` peer range (now `>=5.0.0 <7.0.0`).
