---
'synstate': major
'synstate-preact-hooks': major
'synstate-preact-signals': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
'synstate-dom': minor
---

`switchMap` and `mergeMap` (and `flatMap`, its alias) project the value their source already holds when they are created, as `map` and `filter` start from it. Before, they projected only the values the source emitted afterwards, so a pipeline built on a state or on an observable with an initial value did nothing until the source next changed: `pageId.pipe(switchMap(fetchPage))` on a state never fetched the page an application opened on.

A completed source is still not projected. A pipeline that relied on the drop now sees one more value at the start. That projection runs inside `pipe()`, whether or not anything subscribes: a pipeline built at module level starts its first request when the module is imported, and a projection that throws on the held value now throws from `pipe()` rather than on a later update. `skipWhile((_, index) => index === -1)` before the operator, which drops only the held value, keeps the old behavior.

synstate-react-hooks, synstate-react-hooks-compat, synstate-preact-hooks and synstate-preact-signals re-export both operators, so the change reaches their consumers too.

synstate-dom takes synstate as a peer dependency, so its release moves that range to the new synstate: a `switchMap` or `mergeMap` that a synstate-dom application builds on a state now projects the state's current value when the component runs.
