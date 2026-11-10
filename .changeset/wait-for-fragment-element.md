---
'synstate-router': minor
---

A navigation to a fragment whose element is not in the document yet now waits for it, so that a page behind a `Suspense` boundary (a `React.lazy` page, or one reading its data with `use`) is scrolled to its fragment once it draws it. The router looks again on every later `flushScroll` and, through the new optional `RouterBrowser.observeDocument` (a `MutationObserver` on the real window), whenever the document changes, until the element is found, the location changes, the user starts scrolling (a wheel, a touch, a key or a pointer press), or `maxFragmentWaitMs` (ten seconds) pass. Before, a fragment `flushScroll` did not find was dropped. `createMemoryBrowser` takes an `observeDocument` option for tests.
