---
'pr-merge-queue': patch
---

`unblock-prs`'s checking ahead keeps the layers it has stacked first, in the order they were stacked, and puts a pull request that becomes a candidate or gains `priority:high` after them, rather than drop and rebuild every layer above it; nothing the queue's order puts after the version pull request stays ahead of it. It releases the first of that order.
