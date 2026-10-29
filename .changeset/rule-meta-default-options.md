---
'eslint-config-typed': patch
'eslint-plugin-synstate': patch
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-fortress': patch
'eslint-plugin-ts-std-forge': patch
'eslint-plugin-ts-type-forge': patch
'eslint-rule-forge': patch
---

Declare each rule's default options as `meta.defaultOptions` instead of the top-level `defaultOptions` that `@typescript-eslint/utils` 8.72 deprecates. ESLint 9.15 and later now merge them into `context.options` too, so a rule that is not configured sees its defaults there instead of an empty list; the defaults themselves are unchanged.
