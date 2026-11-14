# synstate-router

## 0.4.0

### Minor Changes

- 87ceb32: `createRouter`'s `redirect` may return a Promise, for a session to check before a page is shown. Until it settles, `match` keeps the page it shows and nothing is written to the history (`router.pending` is `true`); a navigation made meanwhile wins, and the stale check's `signal` (the new third argument) is aborted; a rejected Promise is reported with `console.error` and read as no redirect. On the first load `router.ready` stays `false` until the URL has settled, and the bindings' `Routes` draw their new `pending` element instead of a page that may redirect. Blockers are now asked about the destination asked for, before redirects.
- 7fa7901: The router sets `document.title` from the `title` in the matched nodes' `meta`: a string, or a function of the page's params and search, the deepest node's winning. It follows every change of the match, so a title made from params updates when only the params change, and a page without one goes back to the title the document had before; a router that never set a title leaves the document's alone. `RouterBrowser` gains an optional `documentTitle`, and `createMemoryBrowser` takes a `title` option and gives `title()` for tests.
- 7ee8301: A node's `href` takes `retain: { from, keys }`, which carries the named search values over from another page's search (a match's `search`, say) unless `search` gives them: a filter kept across pages without building the search by hand. The keys are limited to the search the destination declares, and the values to its codecs' types. The result is the same canonical `Href` as one built by hand, and a value equal to its default is still left out of the URL.
- b6ab6dd: A navigation can now be blocked, for a page with unsaved changes. `router.block(shouldBlock)` registers a blocker that `push`, `replace`, `setSearch`, `follow` and a `Link`'s click ask before writing the history; a back, forward or `go` it blocks, the browser's buttons included, is undone once `popstate` arrives, so `match` does not change; and while it blocks a move with no destination, unloading the document asks the user first. A held navigation waits in the blocker's `state` for `proceed()` or `reset()`. synstate-router-react adds `useBlocker(shouldBlock)` and synstate-router-dom adds `blockWhile(when, except?)`. To undo a history move, the router now keeps each entry's position in the state it writes (`{ synstateRouterIndex, state }`); `RouterBrowser` gains an optional `onBeforeUnload`, and `createMemoryBrowser` an `unload()` for tests.
- a6d03ea: Require `synstate` 9 as a peer (and, for synstate-dom and blueprint-synstate, `ts-data-forge` 15). Its `Optional` is unwrapped at runtime (a `Some` is the value it holds), and these packages read the snapshots of observables through `Optional.unwrap`, which would misread the `{ $$tag, value }` object an earlier synstate returns. The peer ranges move with this release (`changeset version` raises the `>=` peer range of a released dependent to the dependency's new version). In synstate-dom, avoid giving `MatchOptional` a constant `Optional.some(observable$)`: a `Some` is its value at runtime, so it is read as `observable$` itself.
- c35b889: A route node can carry `meta`, data of its own typed as written, which the node exposes as `meta`. `router.branch` and `matchedBranch(routes, match)` list the matched nodes from the top of the tree down to the page, each with its `id`, its `meta` and the `Href` of its own page with the match's params, so that a breadcrumb or a title is built without a lookup table; synstate-router-react's `useBranch()` reads it. `meta` is now a reserved key, so a child route can no longer be named `meta`.
- 88eb8ce: Devtools for synstate-router. synstate-router-react adds `RouterDevtools`, a development panel showing the location, the match, the route tree with the matched branch marked, and the last redirects; load it behind `import.meta.env.DEV` with `React.lazy`, so that a production build drops it. synstate-router adds what it reads: `describeRoutes(routes)`, every node with its pattern, params, search keys and whether it is a page, and `router.redirects`, the last redirects followed (up to `maxRedirectRecords`).
- 0b9642c: A page can declare a typed history state with `state: historyState.custom({ decode, encode })` or `historyState.schema(schema)`. `push(href, { state })` and `replace(href, { state })` write the value, encoded by the destination page's codec, next to the URL rather than in it, and the page's match reads it back as `state` (`undefined` when the entry has none or it does not decode), restored by back and forward; `pageValues`, and so a binding's case, carry it too. `setSearch` and canonicalizing the URL keep the entry's state, and a redirect drops it. `createMemoryBrowser` keeps a state per entry, a structured clone as a browser stores it, and `RouterBrowser` gains an optional `history.state`. `state` is now a reserved key, so a child route can no longer be named `state`.
- 323fb7e: A navigation can run inside a View Transition: `push(href, { viewTransition: true })`, `replace` with the same option, and `viewTransition` on both bindings' `Link` wrap the update in `document.startViewTransition`, which ends once a binding's `Routes` has drawn the new page, or after the next frame without one. Where the browser has no View Transitions the navigation is made as usual. `RouterBrowser` gains an optional `startViewTransition`, and `createMemoryBrowser` a `viewTransitions` option with `viewTransitions()` for tests.

### Patch Changes

- 6c7a0d3: Export `ParamValue`, `SearchValue`, `AnySearchCodecs` and `TrailingSlash`, which its exported route and router types name.
- Updated dependencies [2f758a4]
- Updated dependencies [ae57625]
- Updated dependencies [e9340d0]
- Updated dependencies [a6d03ea]
- Updated dependencies [e7b459f]
- Updated dependencies [430b433]
- Updated dependencies [553a883]
- Updated dependencies [a34ddd2]
- Updated dependencies [a9163fe]
- Updated dependencies [6722a9e]
- Updated dependencies [593ca51]
- Updated dependencies [dcf7544]
- Updated dependencies [d5640ce]
- Updated dependencies [40645fa]
    - ts-type-forge@9.2.6
    - ts-data-forge@15.0.0
    - synstate@9.0.0

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
