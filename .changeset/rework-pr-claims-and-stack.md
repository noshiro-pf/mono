---
'pr-merge-queue': minor
---

`rework-pr` refuses a pull request someone has claimed or that `unblock-prs` set aside for a skill to fix. `done` carries along the pull requests stacked on the branch and refuses untracked files that are not ignored. `start` now fails on a draft error other than a refusal. A refused push hints at a fetch only when the lease refused it.
