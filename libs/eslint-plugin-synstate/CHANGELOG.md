# eslint-plugin-synstate

## 0.7.0

### Minor Changes

- 5b2ba61: `no-observable-in-handler` also reports an observable created, or a subscription made, after an `await` in a component: in an `async` function that contains JSX or is written inside a function that does, other than JSX passed to a `render` call. It reports what may run after an `await` there: after it in source order, with it in the call's own arguments, in the body of a `for await`, and in the body, test or update of a loop that awaits. A component runs in its scope only until it returns, so what follows the first `await` belongs to no scope and is never disposed or ended. Code before the first `await`, work in the `run` of a scope taken with `getCurrentScope()` before it, and `untracked(…)` are not reported; an `async` callback of `run` is in its scope only until its first `await`, and what follows is reported.
- c9df77c: synstate: a `subscribe` made while a scope runs (`createScope`, `scope.run`) now belongs to that scope, as an observable created there does, and `scope.dispose()` unsubscribes it first, before disposing the child scopes, running the `onScopeDispose` cleanups and disposing the owned observables. A subscription made outside every scope, or inside `untracked`, lasts as before, until `unsubscribe` or completion. An update and a completion now run in no scope, whichever scope wrote the value or completed the observable, so a subscription that a subscriber, or `switchMap` and `mergeMap` for an inner observable, makes on hearing it belongs to no scope that happened to be running; `collectToArray` subscribes in none either. A subscription that ends on its own (`unsubscribe`, completion) is forgotten by its scope.

    Breaking: a subscription made inside `scope.run` that was meant to outlive the scope must now be made inside `untracked`. A subscription made in a scope hears no completion of the observables that scope disposes, since it ends first.

    synstate-dom: `subscribeInScope` is removed. Write `source.subscribe(next)`: made while a component mounts, it belongs to the component's scope and ends with it.

    Breaking: replace `subscribeInScope(source, next)` with `source.subscribe(next)`.

    eslint-plugin-synstate: `no-observable-in-handler` also reports a `.subscribe(…)` made in an event handler or listener on a synstate observable that does not complete by itself, since no scope ends it there.

    synstate-router: `follow` keeps following until it is stopped or the router is disposed, also when it is started while a scope runs. The release moves the `synstate` peer range to the new major, so it needs the synstate release above; nothing else changes for its consumers.

    synstate-router-dom: its subscriptions are made with `subscribe` in the scope they belong to, so it needs the synstate release above.

    synstate-preact-signals, synstate-preact-hooks, synstate-react-hooks, synstate-react-hooks-compat: they re-export synstate, whose `subscribe` above now ends with the scope it is made in, so each takes a major release with it.

### Patch Changes

- fef212d: synstate-dom: `view` and its type `View` are removed, and `derive` is renamed `deriveBindable`. A transformed observable is bound as `source.pipe(map(fn))`, the one way to write it: a `map` node created in a component or a `For` row belongs to that scope and is disposed with it, and passes on a result only when it is not `Object.is` the last one. `deriveBindable` pairs with `mapBindable` and no longer shares its name with synstate's `derive`.

    `Bindable<T>` is `InitializedObservable<T> | Constant<T>` everywhere: an element's attributes, DOM properties, text children and the values of its `class` and `style` objects take the same type as a component's props, `mapBindable`, `deriveBindable` and `toObservable`.

    Breaking: replace `view(source, fn)` with `source.pipe(map(fn))`, `View<T>` with `InitializedObservable<T>` (or `Bindable<T>`), and synstate-dom's `derive` with `deriveBindable`.

    blueprint-synstate: built on the API above. Its props typed `Bindable`, `children` included, take `source.pipe(map(fn))` where they took a `view`.

    eslint-plugin-synstate: `no-observable-in-handler` reports synstate-dom's `deriveBindable` where it reported `derive`.

    synstate-router-dom: `Link`'s `to` and its `<a>` attributes take `source.pipe(map(fn))` where they took a `view`.

- Updated dependencies [b0c7efb]
- Updated dependencies [00010f5]
- Updated dependencies [72f799b]
    - eslint-rule-forge@0.9.0

## 0.6.4

### Patch Changes

- Updated dependencies [9c5c814]
- Updated dependencies [95c464f]
- Updated dependencies [b2ce1b1]
    - eslint-rule-forge@0.8.0

## 0.6.3

### Patch Changes

- Updated dependencies [23fad6b]
- Updated dependencies [23bfcbe]
    - eslint-rule-forge@0.7.0
    - ts-type-forge@9.2.3

## 0.6.2

### Patch Changes

- Updated dependencies [292016d]
    - eslint-rule-forge@0.6.0

## 0.6.1

### Patch Changes

- 01dc5be: `hasForeignBinding` now passes over a binding with no value meaning inside the file — a type parameter, a local type alias or interface — and keeps looking outwards, because a type does not shadow the value, or the head of the qualified name, that a fix writes. Before, the rules that guard their fix with it reported code such as `function f<Arr>() { return xs.length > 0; }` but offered no fix; they now fix it. A rule that uses it to decide whether a call is the module's at all, such as `prefer-pipe-map-nullable` for `pipe`, now also reports a call made inside such a scope. A type-only binding at the top of the file still counts, because the import a fix adds there would conflict with it when the export also has a type meaning. `prefer-namespace-import` still gives up its fix where a type parameter or local type of the namespace name would capture a reference in a type position.
- Updated dependencies [e9420e9]
- Updated dependencies [01dc5be]
    - ts-std-forge@0.5.3
    - eslint-rule-forge@0.5.1

## 0.6.0

### Minor Changes

- b57dab5: New rule `no-observable-in-handler`, on in `recommended`: it reports an observable derived in an event handler, such as `a$.pipe(map(f))` in an `onClick`, or in a listener passed to synstate-dom's `listenInScope` or to `addEventListener`. The handler runs outside every scope, so such an observable is never disposed and its parents keep computing it. It reads the code written inside the handler, nested callbacks included, and the functions of the same file the handler calls by name; a function passed by name to a call other than `addEventListener` or `listenInScope` is not followed. It accepts an observable created inside the callback of a scope's `run`, except a `run` on a scope made right there with no parent (`createScope()`, `createScope(getCurrentScope())` and the like), inside `untracked`, or in the app passed to synstate-dom's `render`. synstate-dom's documentation used to promise a run-time warning for this, which was never implemented. It now points to this rule.

### Patch Changes

- bc06875: `no-unbounded-counter-pipe`'s README section and doc comment describe parent completion as it is: since synstate 4.0.0 a child completing does not complete its parents. They no longer call it synstate's next major or point at its deleted `NEXT_MAJOR.md`.

## 0.5.1

### Patch Changes

- Updated dependencies [ae82fef]
- Updated dependencies [7001f62]
- Updated dependencies [5a9d62a]
    - eslint-rule-forge@0.5.0

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
