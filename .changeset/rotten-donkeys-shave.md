---
'synstate': patch
'synstate-preact-hooks': patch
'synstate-preact-signals': patch
'synstate-react-hooks': patch
'synstate-react-hooks-compat': patch
---

Point `module` and `types` at files that exist. Both named `./dist/index.js`
and `./dist/index.d.ts`, which the build has never emitted — it emits
`./dist/index.mjs` and `./dist/index.d.mts`, as the `exports` map already said.
Modern resolution reads `exports` and was unaffected; anything falling back to
the legacy fields found nothing.

Also declare `engines` (Node >= 22.22.2) and `publishConfig`, bringing these
packages in line with the rest of the repository.
