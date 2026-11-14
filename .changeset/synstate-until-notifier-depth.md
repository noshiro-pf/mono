---
'synstate': patch
---

`takeUntil(notifier)` and `skipUntil(notifier)` hear the notifier first in an update that reaches both the source and the notifier (both derive from one observable), however deep the notifier is: if the notifier emits in that update, or has completed by then, `takeUntil` completes without passing the source's value in that update on, and `skipUntil` passes that value on. Until now, with a notifier deeper than the operator, or as deep and queued after it, `takeUntil` passed that value on and `skipUntil` dropped it. Both operators now take a `depth` greater than the notifier's as well as the source's.
