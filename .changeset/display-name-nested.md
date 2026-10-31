---
'eslint-config-typed': patch
---

`react-coding-style/display-name` looks for a memo component's `displayName` assignment in the statement right after its declaration, in the same statement list, wherever it is declared (a function body, a block, a `case`, a class static block, a namespace). A component declared inside a function is no longer reported when the next statement assigns its `displayName`; an assignment placed after the enclosing top-level variable declaration, which used to be accepted, is now reported as missing.
