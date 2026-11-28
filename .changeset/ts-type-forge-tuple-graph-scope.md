---
'eslint-plugin-ts-type-forge': patch
---

`prefer-canonical-length-constrained-tuple` now follows each name to the
declaration it binds to, through the scope manager, when it looks for a cycle
back to the declaration a tuple sits in. Declarations that only share a spelling
(a local in two functions, a namespace member and a top-level alias) no longer
withhold each other's rewrites.
