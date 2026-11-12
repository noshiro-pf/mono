---
'synstate-router-preact': minor
---

`Link` takes a `state` prop: the destination page's history state, written with the navigation as `router.push(href, { state })` writes it, and restored by back and forward. A click the browser handles (a modifier key, `target`, `download`, an `ExternalHref`) writes none.
