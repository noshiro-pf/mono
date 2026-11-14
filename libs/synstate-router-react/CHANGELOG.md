# synstate-router-react

## 0.2.0

### Minor Changes

- 87ceb32: `createRouter`'s `redirect` may return a Promise, for a session to check before a page is shown. Until it settles, `match` keeps the page it shows and nothing is written to the history (`router.pending` is `true`); a navigation made meanwhile wins, and the stale check's `signal` (the new third argument) is aborted; a rejected Promise is reported with `console.error` and read as no redirect. On the first load `router.ready` stays `false` until the URL has settled, and the bindings' `Routes` draw their new `pending` element instead of a page that may redirect. Blockers are now asked about the destination asked for, before redirects.
- b6ab6dd: A navigation can now be blocked, for a page with unsaved changes. `router.block(shouldBlock)` registers a blocker that `push`, `replace`, `setSearch`, `follow` and a `Link`'s click ask before writing the history; a back, forward or `go` it blocks, the browser's buttons included, is undone once `popstate` arrives, so `match` does not change; and while it blocks a move with no destination, unloading the document asks the user first. A held navigation waits in the blocker's `state` for `proceed()` or `reset()`. synstate-router-react adds `useBlocker(shouldBlock)` and synstate-router-dom adds `blockWhile(when, except?)`. To undo a history move, the router now keeps each entry's position in the state it writes (`{ synstateRouterIndex, state }`); `RouterBrowser` gains an optional `onBeforeUnload`, and `createMemoryBrowser` an `unload()` for tests.
- a6d03ea: Require `synstate` 9 as a peer (and, for synstate-dom and blueprint-synstate, `ts-data-forge` 15). Its `Optional` is unwrapped at runtime (a `Some` is the value it holds), and these packages read the snapshots of observables through `Optional.unwrap`, which would misread the `{ $$tag, value }` object an earlier synstate returns. The peer ranges move with this release (`changeset version` raises the `>=` peer range of a released dependent to the dependency's new version). In synstate-dom, avoid giving `MatchOptional` a constant `Optional.some(observable$)`: a `Some` is its value at runtime, so it is read as `observable$` itself.
- c35b889: A route node can carry `meta`, data of its own typed as written, which the node exposes as `meta`. `router.branch` and `matchedBranch(routes, match)` list the matched nodes from the top of the tree down to the page, each with its `id`, its `meta` and the `Href` of its own page with the match's params, so that a breadcrumb or a title is built without a lookup table; synstate-router-react's `useBranch()` reads it. `meta` is now a reserved key, so a child route can no longer be named `meta`.
- 88eb8ce: Devtools for synstate-router. synstate-router-react adds `RouterDevtools`, a development panel showing the location, the match, the route tree with the matched branch marked, and the last redirects; load it behind `import.meta.env.DEV` with `React.lazy`, so that a production build drops it. synstate-router adds what it reads: `describeRoutes(routes)`, every node with its pattern, params, search keys and whether it is a page, and `router.redirects`, the last redirects followed (up to `maxRedirectRecords`).
- a49f655: `Routes` takes `error`, drawn in place of a case that throws while rendering, with what it threw and a `retry` that draws the case again. Each case gets its own error boundary, so the layouts around `Routes` stay drawn, and a navigation to another route, or to the same route with other params or search, clears it. Without `error`, a thrown error reaches the nearest boundary above `Routes`, as before.
- 323fb7e: A navigation can run inside a View Transition: `push(href, { viewTransition: true })`, `replace` with the same option, and `viewTransition` on both bindings' `Link` wrap the update in `document.startViewTransition`, which ends once a binding's `Routes` has drawn the new page, or after the next frame without one. Where the browser has no View Transitions the navigation is made as usual. `RouterBrowser` gains an optional `startViewTransition`, and `createMemoryBrowser` a `viewTransitions` option with `viewTransitions()` for tests.

### Patch Changes

- Updated dependencies [87ceb32]
- Updated dependencies [7fa7901]
- Updated dependencies [7ee8301]
- Updated dependencies [2f758a4]
- Updated dependencies [ae57625]
- Updated dependencies [b6ab6dd]
- Updated dependencies [e9340d0]
- Updated dependencies [a6d03ea]
- Updated dependencies [a6d03ea]
- Updated dependencies [e7b459f]
- Updated dependencies [c35b889]
- Updated dependencies [88eb8ce]
- Updated dependencies [430b433]
- Updated dependencies [553a883]
- Updated dependencies [a34ddd2]
- Updated dependencies [a9163fe]
- Updated dependencies [6722a9e]
- Updated dependencies [6c7a0d3]
- Updated dependencies [593ca51]
- Updated dependencies [dcf7544]
- Updated dependencies [d5640ce]
- Updated dependencies [40645fa]
- Updated dependencies [0b9642c]
- Updated dependencies [323fb7e]
    - synstate-router@0.4.0
    - ts-type-forge@9.2.6
    - ts-data-forge@15.0.0
    - synstate@9.0.0

## 0.1.1

### Patch Changes

- acd78c5: Publish through npm trusted publishing for the first time. Nothing in the packages changes.
- Updated dependencies [7174d10]
- Updated dependencies [acd78c5]
    - ts-type-forge@9.2.5
    - synstate-router@0.2.1
    - synstate@8.0.0
