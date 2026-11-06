---
'synstate-router': patch
---

`follow` forgets an observable once it completes, so a component that follows an observable it owns no longer makes the router accumulate an entry for each mount. A move the observable queued just before completing still happens, and `dispose` still cancels it.
