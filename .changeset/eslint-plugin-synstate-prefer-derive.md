---
'eslint-plugin-synstate': minor
---

Add `prefer-derive`, enabled at `error` by the `recommended` preset. It reports `combine(parents).pipe(map(fn))`, which is two observables and builds a tuple on every update, and rewrites it to `derive(parents, fn)` from synstate: an array pattern becomes the parameters (`([a, b]) =>` to `(a, b) =>`), a name becomes a rest parameter, and `map`'s `equals` is passed on. A `map` to a constant (`map(() => c)`) or an identity `map` is left to `prefer-map-to` or `no-identity-map`. A mapping function that is not an arrow function written in place, a parameter with a type annotation, a default, a `?` or a hole, a type wrapper, parentheses or type arguments around the calls, or a comment the rewrite would drop, is reported without a fix. `derive` is in synstate 6.1.0 and later, so the fix needs that version.

`prefer-map-to` and `no-identity-map` no longer fix a namespace callee in a type wrapper, such as `(S.map as M)(() => c)`: the cast was written for `map`, and the fix kept it on another export.
