---
'synstate-router': minor
---

`handleLinkClick` and `NavigateOptions` take a `state`, which a routed click passes to `push` / `replace` as the destination page's history state; a click the browser handles writes none.
