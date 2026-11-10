---
'eslint-config-typed': minor
---

The `ts-restrictions/*` rules are now also published on their own, as
`eslint-plugin-ts-restrictions`, for projects that want them without the
third-party ESLint plugins this package depends on. This package depends on that
one and registers the same rules under the same ids, so a config using
`eslintPluginTsRestrictions` or `eslintTsRestrictionsRules` needs no change.

`ts-restrictions/prefer-catch` and `ts-restrictions/prefer-global-this` stay in
this package only: they wrap rules of `eslint-plugin-promise` and
`eslint-plugin-unicorn`, which the standalone plugin does not depend on.
`editorconfig-without-wasm` is no longer a direct dependency; it comes through
the new package. `@types/estree` is dropped: nothing this package publishes
imports it any longer.
