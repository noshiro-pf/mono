---
'pr-merge-queue': patch
---

`unblock-prs` ends a watch by what the review read at its end says: a hold a review clears is left to triage with no record or demotion, one only a bypass clears ends `awaiting-bypass`, and a read of another head ends `head-moved`, rather than all of them setting the pull request aside `not-merging`.
