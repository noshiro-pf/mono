---
'eslint-plugin-ts-data-forge': patch
---

`no-unnecessary-type-guard` recognizes the variants of the unwrapped `Optional` by the `unique symbol` keys of their type-only properties, declared in `ts-std-forge-keys`, including through a mapped type that remaps keys.
