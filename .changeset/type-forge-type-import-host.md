---
'eslint-plugin-ts-type-forge': patch
---

The autofixes of `prefer-canonical-length-constrained-tuple` and `prefer-canonical-mutable-record`, and the suggestions of `prefer-readonly-or-mutable-record` and `prefer-strict-or-relaxed-utility-type` now add the type they write to the file's existing ts-type-forge import instead of a new declaration, so the fixed file passes `import-x/no-duplicates`:

- An `import type { … }` gets `X`; otherwise an `import { … }` gets `type X` (empty braces included); otherwise a lone default import gets `, { type X }`. Only a file with none of these gets a new `import { type X } from 'ts-type-forge'`, after any directives.
- Every fix that writes a type the file does not import adds the import itself, so a fix applied alone (an editor quick fix) no longer writes a type nothing imports; the first such fix also imports the other reports' types, as before. `eslint --fix` usually takes a second pass when a file has several reports and one needs a new import, and one more where the rewrites are nested.
- A name another ts-type-forge export is already imported under (`import { type X as FixedLengthTuple }`) is now treated like any other binding of it: the rule stays silent instead of writing a second binding of the same name.
