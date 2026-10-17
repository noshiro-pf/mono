---
'synstate': patch
---

`zip` completes once a completed source has no value left to pair, as its documentation says and as RxJS's `zip` does: at once if that source completes with nothing queued, otherwise right after the tuple that takes its last queued value. It used to wait until every source had completed.
