---
'synstate': patch
---

`takeUntil` and `skipUntil` now unsubscribe from their notifier. `takeUntil` releases it when the result completes for any reason (the notifier, the parent, a finished downstream, or `complete()`); `skipUntil` releases it on the notifier's first emission, or when the result completes before that. Both now complete, like other operators with a teardown, when their last downstream completes and nothing else subscribes to them.
