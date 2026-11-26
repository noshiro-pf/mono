---
'eslint-plugin-ts-restrictions': minor
'eslint-config-typed': minor
---

`no-hidden-type-assertions` moved from `eslint-config-typed`'s `total-functions`
plugin to `eslint-plugin-ts-restrictions`, as
`ts-restrictions/no-hidden-type-assertions`. It grew far past the rule of the
same name in `eslint-plugin-total-functions`, and `total-functions` keeps the
original rules alone. The rule is unchanged, and both presets leave it off.

`total-functions/no-hidden-type-assertions` stays registered, deprecated, until
the next major, so that a config or an `eslint-disable` comment naming it still
loads; its generated rule type accepts only `0`, so a type-checked config has to
rename it.
