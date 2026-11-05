---
'eslint-config-typed': patch
---

`total-functions/no-hidden-type-assertions` reports fewer calls that assert nothing. With TypeScript 5.8 and later it also asks the type arguments the checker resolved for a call, besides the written type argument or default: a call whose type argument is neither written nor inferred, such as `isT(v)` for `isT<T>(x: unknown): x is T` or `f()` for `f<T>(): T`, resolves it to `unknown` and is no longer reported, while one inferred from the contextual type, as in `const s: string = f()`, still is, unless the type parameter defaults to `unknown` or `never` as before. Each type parameter only the return type uses is judged on its own, so one that a value parameter uses no longer needs a `never` default for the call to pass. A cast to a type guard or assertion function of `unknown` or `never`, or to `asserts x`, asserts nothing. The message says that a type argument inferred from the context counts too.
