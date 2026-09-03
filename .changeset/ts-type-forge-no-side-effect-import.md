---
'eslint-plugin-ts-type-forge': minor
---

Add `no-side-effect-import`, which reports and deletes a side-effect-only
`import 'ts-type-forge';`. The package ships declarations and nothing else — its
`exports` map offers no runtime condition — so the import binds no name and
fails to resolve once the module graph is loaded, and a side-effect import is
the one kind TypeScript never elides. Only the bare specifier matches:
`ts-type-forge/global`, the ambient globals, is left alone.

The rule is part of the `recommended` preset.
