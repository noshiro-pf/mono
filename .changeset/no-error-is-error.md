---
'eslint-config-typed': minor
---

`unicorn/prefer-error-is-error` is off and `unicorn/no-instanceof-builtins` no longer fixes `instanceof Error` into `Error.isError`, which Node.js 22 (still in `engines`) does not have; `no-restricted-properties` now reports a hand-written `Error.isError`, and its options are exported as `restrictedProperties`.
