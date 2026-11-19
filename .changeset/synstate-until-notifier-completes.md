---
'synstate': patch
---

Say in the documentation of `takeUntil` and `skipUntil` that a notifier which
completes without emitting ends them as an emission does: it completes
`takeUntil`, and ends `skipUntil`'s skipping, at once when it has completed
already. In RxJS such a notifier is ignored. The behavior is unchanged, and now
tested.
