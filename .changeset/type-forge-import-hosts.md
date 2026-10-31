---
'eslint-plugin-ts-type-forge': patch
---

A fix that imports a type, when the file has no `import type { … }` from `ts-type-forge`, adds it as `type X` to an import from it that has a value specifier before one that has only `type` specifiers or empty braces, as the other plugins' fixes place a value (through `eslint-rule-forge`'s `addTypeImports`).
