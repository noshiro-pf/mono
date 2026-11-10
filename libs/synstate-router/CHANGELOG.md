# synstate-router

## 0.3.0

### Minor Changes

- 08aae75: `createRouter`'s `redirect` now receives the location being resolved as its second argument, next to the match: the canonical pathname below the base, the search and the hash. A redirect from a URL that matches no page can carry that URL's query and hash, and inside `push`, `replace` and `setSearch` the location is the destination rather than the URL the browser is still at.
- cb45d70: Add `param.rest`, a catch-all path parameter for the rest of the path: `/docs/a/b/c/` matches a node declared with `params: { path: param.rest }` with `path` as `['a', 'b', 'c']`. It takes one segment or more, is allowed only on a node with no children (a type error and a `defineRoutes` error otherwise), and ranks below every static and dynamic sibling. `href` encodes each segment, so a `/` inside one stays inside it. `param.restCustom({ decode, encode })` reads the segments into a value of its own type.
- c952894: A navigation to a fragment whose element is not in the document yet now waits for it, so that a page behind a `Suspense` boundary (a `React.lazy` page, or one reading its data with `use`) is scrolled to its fragment once it draws it. The router looks again on every later `flushScroll` and, through the new optional `RouterBrowser.observeDocument` (a `MutationObserver` on the real window), whenever the document changes, until the element is found, the location changes, the user starts scrolling (a wheel, a touch, a key or a pointer press), or `maxFragmentWaitMs` (ten seconds) pass. Before, a fragment `flushScroll` did not find was dropped. `createMemoryBrowser` takes an `observeDocument` option for tests.

### Patch Changes

- synstate@8.0.0

## 0.2.1

### Patch Changes

- acd78c5: Publish through npm trusted publishing for the first time. Nothing in the packages changes.
- Updated dependencies [7174d10]
    - ts-type-forge@9.2.5
    - synstate@8.0.0

## 0.2.0

### Minor Changes

- c9df77c: synstate: a `subscribe` made while a scope runs (`createScope`, `scope.run`) now belongs to that scope, as an observable created there does, and `scope.dispose()` unsubscribes it first, before disposing the child scopes, running the `onScopeDispose` cleanups and disposing the owned observables. A subscription made outside every scope, or inside `untracked`, lasts as before, until `unsubscribe` or completion. An update and a completion now run in no scope, whichever scope wrote the value or completed the observable, so a subscription that a subscriber, or `switchMap` and `mergeMap` for an inner observable, makes on hearing it belongs to no scope that happened to be running; `collectToArray` subscribes in none either. A subscription that ends on its own (`unsubscribe`, completion) is forgotten by its scope.

    Breaking: a subscription made inside `scope.run` that was meant to outlive the scope must now be made inside `untracked`. A subscription made in a scope hears no completion of the observables that scope disposes, since it ends first.

    synstate-dom: `subscribeInScope` is removed. Write `source.subscribe(next)`: made while a component mounts, it belongs to the component's scope and ends with it.

    Breaking: replace `subscribeInScope(source, next)` with `source.subscribe(next)`.

    eslint-plugin-synstate: `no-observable-in-handler` also reports a `.subscribe(…)` made in an event handler or listener on a synstate observable that does not complete by itself, since no scope ends it there.

    synstate-router: `follow` keeps following until it is stopped or the router is disposed, also when it is started while a scope runs. The release moves the `synstate` peer range to the new major, so it needs the synstate release above; nothing else changes for its consumers.

    synstate-router-dom: its subscriptions are made with `subscribe` in the scope they belong to, so it needs the synstate release above.

    synstate-preact-signals, synstate-preact-hooks, synstate-react-hooks, synstate-react-hooks-compat: they re-export synstate, whose `subscribe` above now ends with the scope it is made in, so each takes a major release with it.

### Patch Changes

- 631fb38: `follow` forgets an observable once it completes, so a component that follows an observable it owns no longer makes the router accumulate an entry for each mount. A move the observable queued just before completing still happens, and `dispose` still cancels it.
- Updated dependencies [931ba22]
- Updated dependencies [72bb513]
- Updated dependencies [60fe319]
- Updated dependencies [c9df77c]
- Updated dependencies [5f66da0]
    - ts-data-forge@14.13.0
    - synstate@8.0.0
