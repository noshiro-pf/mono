# eslint-plugin-synstate

## 0.5.0

### Minor Changes

- ba14fd7: `no-write-during-propagation` recognizes the factories imported from `synstate-react-hooks`, `synstate-react-hooks-compat`, `synstate-preact-hooks` and `synstate-preact-signals` as well as from `synstate`, and treats a `useObservableEffect` callback as a subscriber.

## 0.4.2

### Patch Changes

- Updated dependencies [2d09754]
    - eslint-rule-forge@0.4.0

## 0.4.1

### Patch Changes

- f248d6b: The fixes of `prefer-map-to`, `no-identity-map` and `prefer-derive` bring the name they write into scope more carefully.

    - The name is added to the file's existing `import { … } from 'synstate'` instead of a new declaration inserted at the top, so a leading directive (`'use client';`) stays first and the fixed file passes `import-x/no-duplicates`.
    - A name imported only as a type (`import { type derive }`) has its `type` dropped, instead of being written as a value nothing imports. One imported by `import type { derive }` gets no fix.
    - A name the file does not import joins the synstate import that has value specifiers, rather than one with only `type` ones.
    - Every fix adds the name itself, so a fix applied alone (an editor quick fix) no longer writes a call nothing imports. `eslint --fix` takes one more pass when several reports in a file need it.
    - No fix is offered when a synstate import already binds the name to another export (`import { map as mapTo }`), instead of one that adds a duplicate binding.
    - `prefer-map-to` offers no fix when the rewrite would drop a comment around the body or the callee, and `no-identity-map` and `prefer-derive` check the parentheses around the callee for one too. A comment beside the property of a namespace call (`S./* … */ map`), which the rewrite keeps, no longer prevents the fix.
    - `no-redundant-skip-if-no-change` offers no fix when the outer `.pipe` is in a type wrapper or parentheses, whose closing half the removal would take.

## 0.4.0

### Minor Changes

- 388a021: Add `prefer-derive`, enabled at `error` by the `recommended` preset. It reports `combine(parents).pipe(map(fn))`, which is two observables and builds a tuple on every update, and rewrites it to `derive(parents, fn)` from synstate: an array pattern becomes the parameters (`([a, b]) =>` to `(a, b) =>`), a name becomes a rest parameter, and `map`'s `equals` is passed on. A `map` to a constant (`map(() => c)`) or an identity `map` is left to `prefer-map-to` or `no-identity-map`. A mapping function that is not an arrow function written in place, a parameter with a type annotation, a default, a `?` or a hole, a type wrapper, parentheses or type arguments around the calls, or a comment the rewrite would drop, is reported without a fix. `derive` is in synstate 6.1.0 and later, so the fix needs that version.

    `prefer-map-to` and `no-identity-map` no longer fix a namespace callee in a type wrapper, such as `(S.map as M)(() => c)`: the cast was written for `map`, and the fix kept it on another export.

## 0.3.1

### Patch Changes

- df02523: Update dependencies
- df02523: Declare each rule's default options as `meta.defaultOptions` instead of the top-level `defaultOptions` that `@typescript-eslint/utils` 8.72 deprecates. ESLint 9.15 and later now merge them into `context.options` too, so a rule that is not configured sees its defaults there instead of an empty list; the defaults themselves are unchanged.
- Updated dependencies [df02523]
- Updated dependencies [df02523]
    - eslint-rule-forge@0.3.2

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
