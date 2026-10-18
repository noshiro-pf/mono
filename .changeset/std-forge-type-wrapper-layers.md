---
'eslint-plugin-ts-std-forge': patch
---

`prefer-safe-number-parse`, `prefer-safe-number-parse-integer`, `prefer-safe-array-length-guard` and `prefer-is-record-and-has-key` draw a conclusion from a type only when it holds at every layer of type wrappers. They no longer report, or drop the `isRecord` guard, when a widening `as` says the value may be something else (`Number(s as string | boolean)`), nor when only a `!` makes an optional value look like a string, an array or a record (`parseFloat(s!)` on `string | undefined`).
