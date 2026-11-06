---
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-fortress': patch
'eslint-plugin-ts-std-forge': patch
'eslint-plugin-ts-type-forge': patch
---

The exported rule types say in each rule's JSDoc table whether it offers suggestions (`hasSuggestions`), so a suggestion-only rule no longer reads as having no rewrite at all. A rule entry with options is typed `readonly [severity, options]`, with the first option kept whole rather than spread into the entry when it is an array.
