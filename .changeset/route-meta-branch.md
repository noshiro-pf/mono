---
'synstate-router': minor
'synstate-router-react': minor
---

A route node can carry `meta`, data of its own typed as written, which the node exposes as `meta`. `router.branch` and `matchedBranch(routes, match)` list the matched nodes from the top of the tree down to the page, each with its `id`, its `meta` and the `Href` of its own page with the match's params, so that a breadcrumb or a title is built without a lookup table; synstate-router-react's `useBranch()` reads it. `meta` is now a reserved key, so a child route can no longer be named `meta`.
