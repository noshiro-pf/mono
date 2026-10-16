---
'eslint-plugin-ts-data-forge': patch
---

Read every `import … from 'ts-data-forge'` declaration rather than only the first. A name imported by a second declaration, such as `Arr` after an `import type` from the same module, is no longer imported again by a fix, and a guard imported there is recognized. The rule helpers now come from the new `eslint-rule-forge` package instead of a copy in this one.
