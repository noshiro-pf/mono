# Next major

- Remove the rules `total-functions/no-unsafe-enum-assignment` and
  `total-functions/no-unsafe-optional-property-assignment`.

    Both are deprecated and do nothing; they are registered, and switched off in
    `eslintTotalFunctionsRules`, only so that a configuration naming them keeps
    loading. Delete any mention of them from your configuration.

## Undecided

- Stop resolving `baseUrl`-relative `paths` in `strict-dependencies`.

    The rule reads `baseUrl` so that legacy `paths` entries resolve as `tsc`
    resolves them, although `baseUrl` is deprecated in TypeScript 6.0. Write
    `paths` relative to the `tsconfig.json` instead. This goes with a change
    to the `typescript` peer range (now `>=5.0.0 <7.0.0`).
