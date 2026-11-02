---
'synstate-dom': patch
---

fix(synstate-dom): `For` and `If` follow an update made before they are attached

A later sibling that writes to what an earlier `For`, `If`, `MatchOptional` or `MatchResult` reads, while the enclosing element (or `render`) is still mounting, no longer leaves the old rows or branch on the page. `For` no longer builds its kept rows a second time without disposing the first ones. The update is applied once the nodes are inserted.

`render` now disposes and removes what it mounted when mounting throws, rather than leaving it in the container with no function to unmount it.
