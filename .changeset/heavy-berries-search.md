---
'ts-codemod-lib': minor
---

Add a `recordStyle` option to `convertToReadonlyTransformer` for making `Record<K, V>` readonly. `"Readonly<Record>"` (default) converts `Record<K, V>` to `Readonly<Record<K, V>>` using only built-in utility types, while `"ReadonlyRecord"` converts it to `ts-type-forge`'s `ReadonlyRecord<K, V>` (no import statement is added). Whichever style is selected, `Readonly<Record<K, V>>` and `ReadonlyRecord<K, V>` are unified to that style, and redundant wrappers such as `Readonly<ReadonlyRecord<K, V>>` are normalized as well (`DeepReadonly<ReadonlyRecord<K, V>>` becomes `DeepReadonly<Record<K, V>>`, matching the existing `Readonly` normalization).
