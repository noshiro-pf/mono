---
'eslint-plugin-ts-std-forge': patch
---

`EslintTsStdForgeRulesOption` is now `ReadonlyRecord<never, never>` instead of `Readonly<{}>`. No rule of this plugin takes options, and `Readonly<{}>` accepted any non-nullish value.
