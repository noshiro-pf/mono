---
'ts-codemod-lib': patch
---

`convertToReadonlyTransformer` leaves a union or intersection whose members it does not change as written, and parenthesizes the one it rewrites, and each member of it, only where precedence needs it.
