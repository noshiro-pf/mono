---
'eslint-plugin-ts-data-forge': patch
---

The rules that add a ts-data-forge import with their fix now bring the name into scope through `eslint-rule-forge`'s `bindValueImports`. They are `no-unnecessary-type-guard`, `prefer-arr-generate`, `prefer-arr-is-bounded-length-array`, `prefer-arr-is-fixed-length-array`, `prefer-arr-is-max-length-array`, `prefer-arr-is-min-length-array`, `prefer-arr-is-non-empty`, `prefer-arr-scan`, `prefer-arr-sum`, `prefer-arr-uniq`, `prefer-as-int`, `prefer-canonical-array-slicing`, `prefer-obj-over-entries-round-trip` and `prefer-range-for-loop`.

- The name is added to the file's existing named import instead of a new declaration, so the fixed file passes `import-x/no-duplicates`, and a leading directive stays first. `Obj` and `Optional` go into one declaration together.
- A name imported only as a type (`import { type Arr }`) has its `type` dropped. One imported by `import type { Arr }` gets the report with no fix, instead of a call nothing imports as a value.
- An aliased import is written by its local name, which `prefer-as-int` and `no-unnecessary-type-guard` also name in their message, and no fix is offered where something other than the import is bound to the name.
- Every fix adds the name itself, so a fix applied alone (an editor quick fix, or a suggestion of `prefer-arr-generate` and `prefer-arr-uniq`) no longer writes a call nothing imports. `eslint --fix` takes one more pass when several reports in a file need it.

`prefer-pipe-map-nullable` uses the shared `hasCommentWithin` instead of its own copy.
