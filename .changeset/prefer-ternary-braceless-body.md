---
'eslint-config-typed': patch
---

`ts-restrictions/prefer-ternary` no longer puts a `;` before its fix when the `if` is the braceless body of a `for`, `while`, `if` or label. There the token before the `if` is that statement's head, so the `;` became the whole body and the folded assignment ran once after it: `for (const k of ks) if (c) (o as T).p = 1; else (o as T).p = 2;` was fixed into `for (const k of ks) ;(o as T).p = c ? 1 : 2;`. The `;` is now added only to a statement in a statement list, where it can join the line before.
