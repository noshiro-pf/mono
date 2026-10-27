# eslint-plugin-synstate

## 0.3.0

### Minor Changes

- 1e83166: Add `no-throw-in-operator`, enabled at `error` by the `recommended` preset. It reports a `throw` in a function given to a synstate operator in `.pipe(...)` (`map`, `filter`, `scan`, `switchMap`, a `map` option such as `equals`, …), and a call from such a function to a function of the same file that throws. synstate catches nothing an operator's function throws, so the exception stops the update midway: the nodes it already reached hold the new value, the rest keep the old one, and the error reaches whoever wrote to the source. Return a `Result` from a pure function instead. A `throw` caught by a `try` in the same function, or in an `async` function or a function the callback only defines, is not reported.

    Add `no-identity-map`, enabled at `error` by the `recommended` preset and fixable. It reports `map((x) => x)` and rewrites it to `skipIfNoChange()`, which is what it does now that `map` stops a result equal to the one it holds. A call with type syntax (an annotation, type arguments, `as`) is reported without a fix.

    `no-redundant-skip-if-no-change` also reports `skipIfNoChange()` piped directly after the operators built on `map` (`pluck`, `getKey`, `mapOptional`, `mapResultOk`, `mapResultErr`, `unwrapOptional`, `unwrapResultOk`, `unwrapResultErr`) and after another `skipIfNoChange()` that compares with `Object.is`.

- ddbb770: Add `prefer-map-to`, enabled at `error` by the `recommended` preset and fixable. It reports `map(() => c)` where `c` is the same value every time (a literal, `undefined`, a `const` or an import) and rewrites it to `mapTo(c)`. synstate's `map` now stops a result equal to the one it holds, so such a `map` on an event stream emits once and never again, while `mapTo` emits on every event. A `map` given `equals`, or whose body calls something or builds an object, is not reported.

    Add `no-redundant-skip-if-no-change`, enabled at `error` by the `recommended` preset and fixable. It reports `skipIfNoChange()` (or `distinctUntilChanged()`) with no comparison or `Object.is`, piped directly onto `x.pipe(map(f))` where that `map` is given no `equals`, and removes it: `map` already stops a result equal to the one it holds.

## 0.2.1

### Patch Changes

- ca74a91: Update dependencies
- Updated dependencies [ca74a91]
    - eslint-rule-forge@0.3.1

## 0.2.0

### Minor Changes

- 69956bd: Add `no-write-during-propagation`, enabled at `error` by the `recommended` preset. It reports a write to a synstate state or source (a `createState` setter, `updateState`, `resetState`, a `createReducer` dispatch, the `createBooleanState` utilities, an emitter, `next` of a `source()`) made directly in a subscriber or in a projection inside `.pipe(...)`. Such a write starts an update inside the one that called it, so it is not part of the graph synstate orders: subscribers can see intermediate states, and a write back into the same update loops. Derive the value with `pipe` instead. A subscriber passed by name and a function of the same file that the callback calls are followed too, and with type information (`parserOptions.projectService`) so is a setter imported from another file.

## 0.1.2

### Patch Changes

- Updated dependencies [384b952]
    - eslint-rule-forge@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [fba7527]
    - eslint-rule-forge@0.2.0
