---
'pr-merge-queue': patch
---

fix(unblock-prs): close the selection the checks query left open, which GitHub now rejects, and release nothing else while a released pull request's checks cannot be read
