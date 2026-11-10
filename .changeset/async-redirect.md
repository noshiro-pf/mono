---
'synstate-router': minor
'synstate-router-react': minor
'synstate-router-dom': minor
---

`createRouter`'s `redirect` may return a Promise, for a session to check before a page is shown. Until it settles, `match` keeps the page it shows and nothing is written to the history (`router.pending` is `true`); a navigation made meanwhile wins, and the stale check's `signal` (the new third argument) is aborted; a rejected Promise is reported with `console.error` and read as no redirect. On the first load `router.ready` stays `false` until the URL has settled, and the bindings' `Routes` draw their new `pending` element instead of a page that may redirect. Blockers are now asked about the destination asked for, before redirects.
