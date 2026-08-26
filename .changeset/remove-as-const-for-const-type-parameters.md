---
'ts-codemod-lib': minor
---

`appendAsConstTransformer` now removes redundant `as const` assertions from
call arguments whose corresponding parameter type is exactly a
`const`-modified type parameter — `f([1, 2] as const)` becomes `f([1, 2])`
for `function f<const T>(x: T): T`, because the `const` type parameter
already makes TypeScript infer the argument as if it were annotated with
`as const`. The removal is conservative: it only happens when the callee
resolves to a single call signature within the transformed file itself, the
call has no explicit type arguments, the argument does not follow a spread
argument, and the parameter type is the bare type parameter (so
`readonly T[]`, overloads and imported callees are left as they are). The
new `removeAsConstForConstTypeParameters` option (default `true`) turns the
behavior off.
