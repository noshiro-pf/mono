---
'pr-merge-queue': patch
---

`run-issue-resolver`: a session that finds every part of its issue already on `main`, done by a pull request that never named the issue, now closes it as completed after a comment saying which pull request or commit did each part. It used to leave only the comment, and the issue stayed open with nothing left to hand on.
