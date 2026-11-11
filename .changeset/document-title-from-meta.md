---
'synstate-router': minor
---

The router sets `document.title` from the `title` in the matched nodes' `meta`: a string, or a function of the page's params and search, the deepest node's winning. It follows every change of the match, so a title made from params updates when only the params change, and a page without one goes back to the title the document had before; a router that never set a title leaves the document's alone. `RouterBrowser` gains an optional `documentTitle`, and `createMemoryBrowser` takes a `title` option and gives `title()` for tests.
