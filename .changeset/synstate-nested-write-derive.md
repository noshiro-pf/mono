---
'synstate': patch
---

The warning a write during an update prints, and the error thrown past 100
nested updates, now recommend deriving the value with `map` / `derive` rather
than `map` / `combine`, as the README and the documentation do.
