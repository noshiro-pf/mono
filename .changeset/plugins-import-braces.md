---
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-fortress': patch
'eslint-plugin-ts-std-forge': patch
---

An autofix that imports a name adds it inside the empty braces of `import {} from '<module>'` or `import D, {} from '<module>'`, where it wrote a duplicate declaration or `import D, { x }, {} from '<module>'`, a syntax error (through `eslint-rule-forge`'s `bindValueImports`).
