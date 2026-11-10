---
'synstate-router': minor
---

Add `param.rest`, a catch-all path parameter for the rest of the path: `/docs/a/b/c/` matches a node declared with `params: { path: param.rest }` with `path` as `['a', 'b', 'c']`. It takes one segment or more, is allowed only on a node with no children (a type error and a `defineRoutes` error otherwise), and ranks below every static and dynamic sibling. `href` encodes each segment, so a `/` inside one stays inside it. `param.restCustom({ decode, encode })` reads the segments into a value of its own type.
