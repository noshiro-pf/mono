---
'ts-codemod-lib': minor
---

`convert-to-readonly` now imports `ReadonlyRecord` from `ts-type-forge` when, with the default `recordStyle: 'ReadonlyRecord'`, it writes the name into a file that does not mention it yet, merging it into an existing named import of `ts-type-forge` where there is one. The output used to leave the name unresolved in any file without the `ts-type-forge/global` declarations loaded. A file that already imports, declares or uses `ReadonlyRecord` is left as before, and a script (a file with no import or export), which an import would turn into a module, and a file whose top level declares the name as a value only get `Readonly<Record<K, V>>` instead. The new `importStyle: 'global'` option keeps the old behavior of never touching imports, for code that has the name in scope already or a caller that adds the import itself.
