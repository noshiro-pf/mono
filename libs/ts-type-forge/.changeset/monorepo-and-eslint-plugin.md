---
'eslint-plugin-ts-type-forge': minor
---

Add `eslint-plugin-ts-type-forge`, an ESLint plugin whose rules steer type
declarations toward ts-type-forge idioms.

Its first rule, `prefer-non-empty-array`, reports the hand-rolled
`readonly [V, ...V[]]` tuple spelling and auto-fixes it to `NonEmptyArray<V>`.
