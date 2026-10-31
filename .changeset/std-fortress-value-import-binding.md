---
'eslint-plugin-ts-std-forge': patch
'eslint-plugin-ts-fortress': patch
---

`prefer-safe-array-length-guard` (`eslint-plugin-ts-std-forge`) and `prefer-canonical-length-constrained-type` (`eslint-plugin-ts-fortress`) now bring a name into scope through `eslint-rule-forge`'s `bindValueImports`:

- The name is added to the file's existing named import instead of a new declaration, so the fixed file passes `import-x/no-duplicates`. Where `prefer-safe-array-length-guard` has to add a declaration, a leading directive stays first.
- A name imported only as a type (`import { type SafeArray }`) has its `type` dropped. One imported by `import type { … }` gets the report with no fix, instead of a call nothing imports as a value.
- `prefer-safe-array-length-guard` writes an aliased import by its local name, in its message as well as its fix, and offers no fix where something other than the import is bound to `SafeArray`.
- Every fix adds the name itself, so a fix applied alone (an editor quick fix) no longer writes a call nothing imports. `eslint --fix` takes one more pass when several reports in a file need it.
