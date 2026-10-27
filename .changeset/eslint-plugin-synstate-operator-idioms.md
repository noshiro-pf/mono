---
'eslint-plugin-synstate': minor
---

Add `no-throw-in-operator`, enabled at `error` by the `recommended` preset. It reports a `throw` in a function given to a synstate operator in `.pipe(...)` (`map`, `filter`, `scan`, `switchMap`, a `map` option such as `equals`, …), and a call from such a function to a function of the same file that throws. synstate catches nothing an operator's function throws, so the exception stops the update midway: the nodes it already reached hold the new value, the rest keep the old one, and the error reaches whoever wrote to the source. Return a `Result` from a pure function instead. A `throw` caught by a `try` in the same function, or in an `async` function or a function the callback only defines, is not reported.

Add `no-identity-map`, enabled at `error` by the `recommended` preset and fixable. It reports `map((x) => x)` and rewrites it to `skipIfNoChange()`, which is what it does now that `map` stops a result equal to the one it holds. A call with type syntax (an annotation, type arguments, `as`) is reported without a fix.

`no-redundant-skip-if-no-change` also reports `skipIfNoChange()` piped directly after the operators built on `map` (`pluck`, `getKey`, `mapOptional`, `mapResultOk`, `mapResultErr`, `unwrapOptional`, `unwrapResultOk`, `unwrapResultErr`) and after another `skipIfNoChange()` that compares with `Object.is`.
