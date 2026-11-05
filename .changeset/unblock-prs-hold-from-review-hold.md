---
'pr-merge-queue': patch
'pr-report-core': patch
---

`unblock-prs` says what holds a pull request that went green and did not merge from its review as read at the watched head — the code owner it waits for, or the unresolved conversations — instead of GitHub's `reviewDecision`, which is `null` under a ruleset, so the set-aside status stops guessing when the review names the hold.

`queueOwner` no longer says the worker cannot read what holds a `not-merging` pull request, since the set-aside now names it when the review does.
