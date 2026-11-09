# synstate-router-dom

## 0.2.1

### Patch Changes

- acd78c5: Publish through npm trusted publishing for the first time. Nothing in the packages changes.
- Updated dependencies [7174d10]
- Updated dependencies [acd78c5]
    - ts-type-forge@9.2.5
    - synstate-router@0.2.1
    - synstate@8.0.0
    - synstate-dom@0.9.0

## 0.2.0

### Minor Changes

- fef212d: synstate-dom: `view` and its type `View` are removed, and `derive` is renamed `deriveBindable`. A transformed observable is bound as `source.pipe(map(fn))`, the one way to write it: a `map` node created in a component or a `For` row belongs to that scope and is disposed with it, and passes on a result only when it is not `Object.is` the last one. `deriveBindable` pairs with `mapBindable` and no longer shares its name with synstate's `derive`.

    `Bindable<T>` is `InitializedObservable<T> | Constant<T>` everywhere: an element's attributes, DOM properties, text children and the values of its `class` and `style` objects take the same type as a component's props, `mapBindable`, `deriveBindable` and `toObservable`.

    Breaking: replace `view(source, fn)` with `source.pipe(map(fn))`, `View<T>` with `InitializedObservable<T>` (or `Bindable<T>`), and synstate-dom's `derive` with `deriveBindable`.

    blueprint-synstate: built on the API above. Its props typed `Bindable`, `children` included, take `source.pipe(map(fn))` where they took a `view`.

    eslint-plugin-synstate: `no-observable-in-handler` reports synstate-dom's `deriveBindable` where it reported `derive`.

    synstate-router-dom: `Link`'s `to` and its `<a>` attributes take `source.pipe(map(fn))` where they took a `view`.

### Patch Changes

- 72bb513: synstate: `createScope(parent, { after })` makes every observable derived in the scope, and in its child scopes, update after `after` in an update that reaches both, however few steps it is from the source.

    synstate-dom: `If`, `MatchOptional` and `MatchResult` mount each branch, and `For` each row, in a scope created with `after: value`, so a branch the next value rules out is disposed before what it derived computes that value. A component the branch mounts that reads `user$.pipe(map((u) => u!.name))` under `<If cond={…user$ is defined…}>` no longer sees `undefined` when the condition is derived in more steps than the branch's own value, as long as the condition updates in the same update as the source (not through `debounce` or `switchMap`). A subscription the branch makes to the source directly still hears the value when the source emits, JSX written inline in `then` is created in the enclosing scope and is not ordered, and a value that arrives while the switch is still mounting (or before it is attached) is applied after the update, as before.

    synstate-router-dom: `Routes` mounts each route's branch in a scope created with `after: router.match` too. What a page derived from `router.location` in one step was as deep as `router.match`, and updated after the switch only because of the order the update queued them in; it now does so by depth.

- c9df77c: synstate: a `subscribe` made while a scope runs (`createScope`, `scope.run`) now belongs to that scope, as an observable created there does, and `scope.dispose()` unsubscribes it first, before disposing the child scopes, running the `onScopeDispose` cleanups and disposing the owned observables. A subscription made outside every scope, or inside `untracked`, lasts as before, until `unsubscribe` or completion. An update and a completion now run in no scope, whichever scope wrote the value or completed the observable, so a subscription that a subscriber, or `switchMap` and `mergeMap` for an inner observable, makes on hearing it belongs to no scope that happened to be running; `collectToArray` subscribes in none either. A subscription that ends on its own (`unsubscribe`, completion) is forgotten by its scope.

    Breaking: a subscription made inside `scope.run` that was meant to outlive the scope must now be made inside `untracked`. A subscription made in a scope hears no completion of the observables that scope disposes, since it ends first.

    synstate-dom: `subscribeInScope` is removed. Write `source.subscribe(next)`: made while a component mounts, it belongs to the component's scope and ends with it.

    Breaking: replace `subscribeInScope(source, next)` with `source.subscribe(next)`.

    eslint-plugin-synstate: `no-observable-in-handler` also reports a `.subscribe(…)` made in an event handler or listener on a synstate observable that does not complete by itself, since no scope ends it there.

    synstate-router: `follow` keeps following until it is stopped or the router is disposed, also when it is started while a scope runs. The release moves the `synstate` peer range to the new major, so it needs the synstate release above; nothing else changes for its consumers.

    synstate-router-dom: its subscriptions are made with `subscribe` in the scope they belong to, so it needs the synstate release above.

    synstate-preact-signals, synstate-preact-hooks, synstate-react-hooks, synstate-react-hooks-compat: they re-export synstate, whose `subscribe` above now ends with the scope it is made in, so each takes a major release with it.

- Updated dependencies [931ba22]
- Updated dependencies [fef212d]
- Updated dependencies [631fb38]
- Updated dependencies [72bb513]
- Updated dependencies [60fe319]
- Updated dependencies [c9df77c]
- Updated dependencies [5f66da0]
    - ts-data-forge@14.13.0
    - synstate-dom@0.9.0
    - synstate-router@0.2.0
    - synstate@8.0.0
