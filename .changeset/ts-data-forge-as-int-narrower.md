---
'eslint-config-typed': patch
'eslint-plugin-ts-data-forge': patch
---

`prefer-as-int` offers as a suggestion rather than a fix a rewrite whose call
would be typed narrower than the cast it replaces (`asInt(0)` is `Int & 0`),
which a `let` it initializes might not take another `Int` into later. An operand
typed `number`, and a cast to `Int8` or `Uint8`, are still fixed.
