---
'pr-merge-queue': patch
---

`unblock-prs` decides whether a pull request needs a ruleset bypass merge for the head its rebase reached, not the head triage read, so a stacked pull request that loses an owned path on the rebase is armed rather than set aside `awaiting-bypass`, and one that gains one is not armed by it.
