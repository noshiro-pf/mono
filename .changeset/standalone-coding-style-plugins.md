---
'eslint-config-typed': minor
---

The `vitest-coding-style/*`, `react-coding-style/*` and `immer-coding-style/*`
rules are now also published on their own, for projects that want them without
the third-party ESLint plugins this package depends on:
`eslint-plugin-vitest-coding-style`, `eslint-plugin-react-coding-style` and
`eslint-plugin-immer-coding-style`. This package depends on them and exports the
same plugin objects under the same names, registered under the same ids, so a
config needs no change. Each now also carries a `recommended` preset
(`configs.recommended`), which this package's own configs do not use.

The forked plugins (`total-functions`, `tree-shakable`, `strict-dependencies`)
stay in this package only. `strict-dependencies/strict-dependencies` gains a
`meta.docs.description`, and `tree-shakable/import-star`'s description reads
"Forbid" for "Forbits".
