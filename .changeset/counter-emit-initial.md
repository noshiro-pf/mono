---
'synstate': minor
---

`counter(ms, { emitInitial: false })` skips the `0` that `counter` emits right after it starts, so the first value is `1`, one interval later (like RxJS `interval(ms)`; the default stays `timer(0, ms)`). Completing a counter now also clears its interval when no `0` was scheduled, and the pending `0` is cleared with `clearTimeout`.
