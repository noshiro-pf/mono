---
'synstate-router': minor
---

A page can declare a typed history state with `state: historyState.custom({ decode, encode })` or `historyState.schema(schema)`. `push(href, { state })` and `replace(href, { state })` write the value, encoded by the destination page's codec, next to the URL rather than in it, and the page's match reads it back as `state` (`undefined` when the entry has none or it does not decode), restored by back and forward; `pageValues`, and so a binding's case, carry it too. `setSearch` and canonicalizing the URL keep the entry's state, and a redirect drops it. `createMemoryBrowser` keeps a state per entry, a structured clone as a browser stores it, and `RouterBrowser` gains an optional `history.state`. `state` is now a reserved key, so a child route can no longer be named `state`.
