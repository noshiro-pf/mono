---
'eslint-config-typed': patch
---

Regenerate the rule option types with the record style unified to `ts-type-forge`'s `ReadonlyRecord<K, V>` (semantically identical to the previous `Readonly<Record<K, V>>` spelling). The rule-type generator now runs the codemod once more after `eslint --fix`, since `@typescript-eslint/consistent-indexed-object-style` used to re-introduce `Readonly<Record<...>>` after the codemod had already run.
