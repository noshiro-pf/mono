---
'eslint-config-typed': patch
---

`total-functions/no-partial-division` now checks `x /= y` as it checks `x / y`. It listened only to `/`, so `unicorn/operator-assignment`'s autofix of a reported `x = x / y` into `x /= y` made the error disappear without the denominator being shown non-zero.
