---
'eslint-config-typed': patch
---

Turn off two rules whose `--fix` changed or broke the code. `promise/prefer-catch` rewrote `p.then(a, b)` into `p.catch(b).then(a)`, which calls `a` after a rejection too; `unicorn/prefer-then-catch` still reports `.then(a, b)` on a standard `Promise` and only suggests a rewrite; `.then(null, b)`, a `Readonly<Promise<T>>` receiver and other thenables are no longer reported. `unicorn/prefer-iterator-concat` rewrote `new Map([...a, ...b])` into `new Map(Iterator.concat(a, b))`, which Node.js 22 does not have and the TypeScript standard library does not declare (TS2339).
