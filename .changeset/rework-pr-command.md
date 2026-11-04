---
'pr-merge-queue': minor
---

Add `rework-pr`, which takes the current branch's pull request out of the queue while more work goes into it (`start`: `skip-ci` on, `merge-queued` off, auto-merge disarmed, a draft) and gives it back for review once that work is pushed (`done`: push with `--force-with-lease`, mark it ready).
