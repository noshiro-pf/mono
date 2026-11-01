---
'ts-codemod-lib': patch
---

`append-as-const` no longer matches arguments to the parameter on their left when the callee declares a `this` parameter, which removed an `as const` that changed the inferred type.
