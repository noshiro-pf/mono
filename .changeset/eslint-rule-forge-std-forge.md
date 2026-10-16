---
'eslint-plugin-ts-std-forge': patch
---

Read every `import … from 'ts-std-forge'` declaration rather than only the first, so that a fix no longer adds an import a second declaration already has. The rule helpers now come from the new `eslint-rule-forge` package instead of a copy in this one.
