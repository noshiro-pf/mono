---
'pr-merge-queue': minor
'pr-report-core': minor
---

`unblock-prs` now ranks a queued pull request that only a ruleset bypass can merge with `priority:low` unless it is labelled `priority:high` (alone), both when picking and when two pull requests are released at once. Picked early, it went green only to be set aside `awaiting-bypass`, and the candidates behind it waited for nothing. `pr-report-core` adds `pickPriorityRank`, and `orderCandidates` takes a required `bypass` predicate; the Pull Requests Manager draws the queue in the same order.
