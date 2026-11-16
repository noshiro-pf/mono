---
'eslint-plugin-synstate': minor
'eslint-config-typed': minor
---

eslint-plugin-synstate gains `no-aria-string-conversion`, which reports an
`aria-*` value whose last step is only a conversion to a string (`String(x)`,
`x.toString()`, `map(String)`, `x ? 'true' : 'false'`): synstate-dom writes a
boolean on an `aria-*` attribute as `"true"` or `"false"` and a number through
`String` itself. It is in the `synstate-dom` preset, and eslint-config-typed's
`eslintConfigForSynstateDom` turns it on.
