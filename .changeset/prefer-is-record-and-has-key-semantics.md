---
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

`prefer-is-record-and-has-key` no longer offers rewrites that change what the code does. An object whose type may be an array (an array, a tuple, a union with one, or a record widened by `as` to one that may be an array) is not reported, because `isRecord` rejects an array and `'0' in xs` would turn from `true` to `false`; `object` and `unknown` say nothing either way and are reported as before. An object with side effects, such as a call or a comma expression, is reported without a fix when the rewrite needs `isRecord`, because `isRecord(obj) && hasKey(obj, key)` would evaluate it twice; when the object is known to be a record, `hasKey(obj, key)` reads it once and the fix stays. The `eslint-plugin-ts-data-forge` version now also keeps the parentheses of a comma expression in the fix and reads `Object` in `Object.hasOwn` through type wrappers, as the `eslint-plugin-ts-std-forge` version already did.
