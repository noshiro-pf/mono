---
'eslint-config-typed': patch
---

`total-functions/no-hidden-type-assertions` no longer stops searching a signature's types at the 100th node among siblings. A type parameter used only from the 101st member of a union, intersection, tuple, type literal or type-argument list on is now found, in the return type (so the call is reported) and in the value parameters (so it is not). The search had no real bound on depth and now has none by design, since a type annotation is a finite syntax tree. A function type's parameters are also explored once instead of twice, so deeply curried callback types no longer take exponential time.
