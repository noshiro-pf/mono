---
'eslint-plugin-ts-fortress': minor
---

Add `no-type-only-codec`, which reports a codec paired with
`type Y = t.TypeOf<typeof X>` whose value nothing reads — no value reference in
its own file, only `import type` elsewhere in the TypeScript project, and no
configured entry point re-exporting it — so that `Y` is declared as a plain type
instead. The rule is type-aware and takes the package's `entryPoints` as an
option, so it is opt-in and not part of `recommended`.
