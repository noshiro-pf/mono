---
'ts-codemod-lib': minor
---

`replace-record-with-unknown-record` now places its `UnknownRecord` import as `convert-to-readonly` places `ReadonlyRecord`'s, through one shared helper, `ensureTsTypeForgeTypeImport(sourceFile, name)`, now exported for custom transformers: a new `import type { UnknownRecord } from 'ts-type-forge';` goes after the last import, after a directive prologue or below a shebang instead of above them, a merge into an `import type { … }` no longer writes `type UnknownRecord` inside it, a namespace import gets a declaration beside it, and the file's CRLF line breaks are kept. A new import from either transformer takes the quotes of the file's last import or directive, single quotes when it has neither.
