---
'eslint-rule-forge': minor
---

New `mayHaveEffect(node, sourceCode)`: `ASTUtils.hasSideEffect` plus what it leaves out — a tagged template, which calls its tag, and a spread into an array or arguments, which runs an iterator — without looking into a function's body, for a fix that moves or drops an expression.
