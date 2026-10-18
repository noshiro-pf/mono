---
'ts-fortress': minor
---

Add `onInvalidElement: 'drop'` to `array`, so that `fill` removes elements that are not of the element type instead of replacing them with filled values. The default stays `'fill'`. The documentation of `union` now states how `prune` and `fill` pick a member, including the declaration-order dependence of `prune` when members overlap.
