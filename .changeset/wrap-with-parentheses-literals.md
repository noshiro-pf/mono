---
'ts-codemod-lib': patch
---

`wrapWithParentheses` ignores parentheses inside string literals, template literal text and comments, so `convert-to-readonly` no longer emits a mis-parenthesized `readonly (A | '(') | (B)[]`. Text it cannot read with certainty — a `/` that may start a regular expression, an unterminated literal, unbalanced parentheses — now always gets a pair, so an already wrapped `(a / b)` becomes `((a / b))`.
