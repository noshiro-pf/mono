---
'eslint-plugin-synstate': minor
---

eslint-plugin-synstate follows the rebuilt synstate. `prefer-map-to` becomes `no-constant-map`, which reports a `map` to a constant: the rebuilt `map` stops an `Object.is` equal result, so such a `map` emits once, and the rule's fix adds `{ equals: () => false }`, under which every emission passes. `prefer-derive` is removed with `combine`, which `derive` replaces. The other rules read the new names (`emit`, `set`, `update`, `derive`).
