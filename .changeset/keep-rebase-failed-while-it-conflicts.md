---
'pr-merge-queue': minor
'pr-report-core': minor
---

`unblock-prs` keeps a `rebase-failed` set-aside across a move of the default branch while the branch still conflicts, updating only the base its comment records, so that the owner stays `skill` and `claim-pr` succeeds. It clears the set-aside only once the conflict is gone. `pr-report-core` gains `moveSetAsideBase`.
