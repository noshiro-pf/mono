---
'ts-repo-utils': patch
'ts-data-forge': patch
---

Keep the imports that an unwrapped identity cast's argument uses.

`stripDevOnlyCode` rewrites `castMutable(f(x))` to `f(x)` by erasing the text of
the callee and the closing parenthesis. The first of those ranges starts at the
call expression's own start, and the pass then decided whether a node still
counted as a reference by asking whether its **start position** fell inside an
erased range. The whole call therefore looked erased — argument included — so
every name the argument used was read as unreferenced and its import was
deleted, while the code that used it stayed. The result type-checked, because
the check runs on the source, and threw `ReferenceError` at runtime.

Two modules of `ts-data-forge@14.6.3` shipped that way: `Arr.scan` called
`newArray` and `asPositiveUint32` without importing them, and `Arr.fill` called
`copy` without importing it. Both threw on first use. `ts-data-forge` is
released again here so that the corrected build goes out; nothing in its source
changed.

The pass now skips a node only when the node is contained in an erased range,
so the callee disappears and the argument does not.
