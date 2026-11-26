---
'ts-codemod-lib': patch
---

`replaceAnyWithUnknownTransformer` writes `keyof any` as `PropertyKey` instead of `keyof unknown`, which is `never`; a file that declares its own `PropertyKey` keeps `keyof any` as written.
