---
'eslint-config-typed': minor
---

`eslintConfigForPreact` now keeps the base `no-restricted-imports` pattern against importing `index.mjs` by relative path. It used to set the rule with its own `preact/compat` paths only, and a config that sets a rule replaces the options an earlier one set, so the pattern was lost in every Preact package. New exports let a config after it restrict more imports without dropping either: `restrictedImportsOptions` (the base options), `restrictedImportsOptionsForPreact` (those plus the `preact/compat` hooks), the `RestrictedImportsOptions` type, and `mergeRestrictedImportsOptions`, which concatenates the `paths` and the `patterns` of the options it is given.
