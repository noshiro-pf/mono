---
'eslint-config-typed': minor
---

New rule `ts-restrictions/prefer-catch`, on in `eslintTsRestrictionsRules`: `promise/prefer-catch` with its fix offered only as a suggestion. `promise/prefer-catch` stays off, since its fix rewrites `p.then(a, b)` into `p.catch(b).then(a)`, which runs `a` after a rejection too; the wrapper restores its reports — `.then(null, b)`, a `Readonly<Promise<T>>` receiver and other thenables, which `unicorn/prefer-then-catch` does not report — without letting `--fix` apply the rewrite.
