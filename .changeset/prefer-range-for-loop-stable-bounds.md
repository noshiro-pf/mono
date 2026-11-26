---
'eslint-plugin-ts-data-forge': patch
---

`prefer-range-for-loop` reads whether a loop's end and step stay the same from their types as well as their writes: it no longer rewrites a loop whose end or step may be an object, an `any` or an `unknown` (an unconstrained type parameter, or anything in a file without type information), a binding another module or script may write (an imported `let` or `var`, a `declare let`, a script's global), or a variable a declaration in the loop or a `for...of` head writes; and it now takes `-x` of a stable number as an end.
