---
'pr-merge-queue': minor
---

A set-aside comment `unblock-prs` rewrites as resolved keeps what it said (the conflicted files, the failed checks with their runs, the output) under a fold, rather than shrinking to one line. A `rebase-failed` one names the merged pull requests that changed the conflicted files on the base since the branch's own base: the other side of the conflict.
