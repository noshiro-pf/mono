---
'synstate-router-react': minor
---

`Routes` takes `error`, drawn in place of a case that throws while rendering, with what it threw and a `retry` that draws the case again. Each case gets its own error boundary, so the layouts around `Routes` stay drawn, and a navigation to another route, or to the same route with other params or search, clears it. Without `error`, a thrown error reaches the nearest boundary above `Routes`, as before.
