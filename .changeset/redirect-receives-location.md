---
'synstate-router': minor
---

`createRouter`'s `redirect` now receives the location being resolved as its second argument, next to the match: the canonical pathname below the base, the search and the hash. A redirect from a URL that matches no page can carry that URL's query and hash, and inside `push`, `replace` and `setSearch` the location is the destination rather than the URL the browser is still at.
