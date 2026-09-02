---
'eslint-plugin-ts-data-forge': minor
---

Add `no-side-effect-import`, which reports and deletes a side-effect-only
`import 'ts-data-forge';`. It binds no name, and the package declares
`sideEffects: false`, so loading it does nothing — but a side-effect import is
the one kind TypeScript never elides, so the module is pulled in for no reason.
Only the bare specifier matches; other modules are none of the rule's business.

The rule is part of the `recommended` preset.
