---
'synstate-router': minor
'synstate-router-react': minor
'synstate-router-dom': minor
---

A navigation can now be blocked, for a page with unsaved changes. `router.block(shouldBlock)` registers a blocker that `push`, `replace`, `setSearch`, `follow` and a `Link`'s click ask before writing the history; a back, forward or `go` it blocks, the browser's buttons included, is undone once `popstate` arrives, so `match` does not change; and while it blocks a move with no destination, unloading the document asks the user first. A held navigation waits in the blocker's `state` for `proceed()` or `reset()`. synstate-router-react adds `useBlocker(shouldBlock)` and synstate-router-dom adds `blockWhile(when, except?)`. To undo a history move, the router now keeps each entry's position in the state it writes (`{ synstateRouterIndex, state }`); `RouterBrowser` gains an optional `onBeforeUnload`, and `createMemoryBrowser` an `unload()` for tests.
