---
'eslint-config-typed': patch
---

`total-functions/no-hidden-type-assertions` looks into the constraint and default of a type parameter that an inner signature or `infer` type declares. On the return type side it reports `f<Foo>()` for `declare function f<T>(): <U extends T>() => U` (and `<U = T>() => U`, and `Foo extends infer U extends T ? U : never`), whose inner type parameter has no value parameter to infer it from and so falls back to `T`. A returned function that hands back what its caller passes, `<U extends T>(u: U) => U`, still passes. On the value parameter side, `f<string>(<U extends string>(u: U) => {})` for `declare function f<T>(cb: <U extends T>(u: U) => void): T` is no longer reported, since the argument ties `T` down.
