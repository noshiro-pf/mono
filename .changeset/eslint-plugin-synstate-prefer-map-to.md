---
'eslint-plugin-synstate': minor
---

Add `prefer-map-to`, enabled at `error` by the `recommended` preset and fixable. It reports `map(() => c)` where `c` is the same value every time (a literal, `undefined`, a `const` or an import) and rewrites it to `mapTo(c)`. synstate's `map` now stops a result equal to the one it holds, so such a `map` on an event stream emits once and never again, while `mapTo` emits on every event. A `map` given `equals`, or whose body calls something or builds an object, is not reported.

Add `no-redundant-skip-if-no-change`, enabled at `error` by the `recommended` preset and fixable. It reports `skipIfNoChange()` (or `distinctUntilChanged()`) with no comparison or `Object.is`, piped directly onto `x.pipe(map(f))` where that `map` is given no `equals`, and removes it: `map` already stops a result equal to the one it holds.
