---
'eslint-plugin-ts-data-forge': patch
---

`prefer-canonical-array-slicing` no longer autofixes a rewrite to `Arr.tail` or `Arr.butLast` (`xs.slice(1)`, `xs.slice(0, -1)`, `Arr.skip(xs, 1)`, `Arr.skipLast(xs, 1)`, and the `toSpliced` and index `filter` forms of the same two). The rewritten call can fail to compile with TS2590, "Expression produces a union type that is too complex to represent", where it has a contextual type, such as an annotation or an argument, so `--fix` turned code that compiled into code that did not. The pattern is still reported, with a message that names the form that compiles (bind the result to an unannotated `const` first), and the rewrite is offered as a suggestion. Rewrites to the other six functions are fixed as before.
