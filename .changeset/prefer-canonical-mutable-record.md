---
'eslint-plugin-ts-type-forge': minor
---

Add the `prefer-canonical-mutable-record` rule, which normalizes
`Mutable<Record<K, V>>` to the canonical ts-type-forge `MutableRecord<K, V>`.
`Mutable` strips the `readonly` modifier from every property, so applied to a
record utility it spells in two steps what `MutableRecord` says in one;
`Mutable<ReadonlyRecord<K, V>>` and the redundant
`Mutable<MutableRecord<K, V>>` collapse to the same type and are normalized the
same way. The rewrite is exactly type-preserving, so the rule ships an autofix,
which follows the configured `importStyle` and reuses an existing ts-type-forge
import (aliases included). Qualified names and files that bind `Mutable` /
`Record` / … themselves are left alone.

The rule is part of the `recommended` config.
