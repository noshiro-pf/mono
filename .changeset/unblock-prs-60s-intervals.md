---
'pr-merge-queue': patch
---

`unblock-prs` now waits 60 seconds by default, instead of 30, between polls of the pull request it watches (`--poll-interval`) and between surveys while the list is changing (`--active-interval`), and slows to `--idle-interval` after 5 unchanged surveys instead of 10, so that still happens after about five minutes. This halves what the queue spends of the account's GraphQL budget, at the cost of noticing a merge about 15 seconds later on average. A watched pull request that is green and not merging is given up on after 2 polls (5 while GitHub reads `BLOCKED`) instead of 3 (8), which keeps those waits at least as long as they were. A released pull request whose reads keep failing now holds the queue for about five minutes, instead of two and a half, before it is set aside as `read-failed`.
