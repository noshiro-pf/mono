---
'eslint-plugin-ts-data-forge': patch
---

`prefer-range-for-loop` leaves alone a loop whose variable is written through
`satisfies` or stacked type wrappers, which `const` would throw on, and offers
as a suggestion rather than a fix a rewrite that narrows the variable a body may
widen: one declared `let i: number`, or bound to an unannotated `let`.
