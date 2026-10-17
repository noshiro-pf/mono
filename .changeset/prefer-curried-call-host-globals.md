---
'eslint-config-typed': patch
---

`ts-restrictions/prefer-curried-call` no longer rewrites `(a) => f(a)` to `f` when `f` is a global the host provides, such as `requestAnimationFrame`, `setTimeout` or `fetch` from the default libraries, which can throw `Illegal invocation` once detached from `globalThis`. ECMAScript's own global functions (`parseFloat`, `Boolean`, ...) are still fixed, and any other global ambient declaration is reported with a suggestion instead of an automatic fix.
