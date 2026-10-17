---
'synstate': minor
---

`counter(ms, { times: n })` completes right after its `n`-th value and clears its timers. Completion does not travel upstream, so `counter(ms).pipe(take(n))` leaves the counter running; `times` is the way to stop it.
