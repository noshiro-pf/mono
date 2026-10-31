---
'eslint-rule-forge': minor
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

`eslint-rule-forge` gains `bindValueImports`, which gives the local names to write for a module's exports and the edits that bind them as values, and exports `hasCommentWithin` and `importedNameOf`. `bindValueImports` adds a name to an existing named import from the module, drops `type` from an inline type specifier, refuses when an import already binds the name to something else, and treats a missing `importKind` (ESLint's default parser) as a value import. A lone default import takes the name in braces (`import D, { x }`). `buildNamedImportFix` now inserts after the directive prologue and any comment on its last line, so `'use client';` stays a directive and an `eslint-disable-line` there keeps its line.

The rules built by `createPreferArrayIsArray`, `createPreferIsNonNullObject`, `createPreferIsRecordAndHasKey`, `createPreferSafeParseInt` and `createPreferSafeParseFloat` (in `eslint-plugin-ts-data-forge` and `eslint-plugin-ts-std-forge`: `prefer-arr-is-array`, `prefer-safe-array-is-array`, `prefer-is-non-null-object`, `prefer-is-record-and-has-key`, `prefer-num-safe-parse-int`, `prefer-num-safe-parse-float`, `prefer-safe-number-parse`, `prefer-safe-number-parse-integer`) use it:

- The name is added to the file's existing named import instead of a new declaration at the top, so the fixed file passes `import-x/no-duplicates` and a leading directive stays first.
- A name imported only as a type (`import { type Arr }`) has its `type` dropped instead of being written as a value nothing imports; one imported by `import type { Arr }` gets no fix.
- An aliased import is written by its local name.
- No fix is offered where something other than the import is bound to the name.
- Every fix adds the name itself, so a fix applied alone (an editor quick fix) no longer writes a call nothing imports. `eslint --fix` takes one more pass when several reports in a file need it.
