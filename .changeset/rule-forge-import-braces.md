---
'eslint-rule-forge': minor
---

`bindValueImports` adds a name inside the empty braces of `import {} from 'm'` or `import D, {} from 'm'`, where it wrote a duplicate declaration or `import D, { x }, {} from 'm'`, a syntax error; the autofixes of the rules this package builds (`prefer-array-is-array`, `prefer-safe-parse`, `prefer-is-non-null-object`, `prefer-is-record-and-has-key`) go through it. New exports: `addTypeImports`, which imports types into an existing `import type { … }` or, as `type X`, into another import from the module, and `addToImportBraces`, the placement both share.
