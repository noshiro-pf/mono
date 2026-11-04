---
'eslint-config-typed': minor
---

`unicorn/prefer-promise-try`, `unicorn/prefer-regexp-escape`, `unicorn/prefer-uint8array-base64` and `unicorn/prefer-get-or-insert-computed` are off, because their fixes write `Promise.try`, `RegExp.escape`, `Uint8Array` base64 and `Map#getOrInsertComputed`, which Node.js 22 (still in `engines`) does not have. A hand-written call to any of these or to `Error.isError` is reported by `no-restricted-properties`, and its `globalThis.`-qualified form by `no-restricted-syntax`, both built from the new `nodeVersionGatedApis` table (exported with `nodeVersionGatedStaticApis`, `nodeVersionRestrictedProperties` and `nodeVersionRestrictedSyntax`).
