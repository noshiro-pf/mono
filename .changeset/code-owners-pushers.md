---
'pr-report-core': minor
'pr-merge-queue': patch
---

`codeOwnerReview` takes `pushers`, who pushed to the pull request's branch: under a check that enforces `CODEOWNERS`, the author stands for a path they own only where everyone who pushed owns it too. `pushersOf` reads them from the repository's activity on the branch, or answers `'unknown'` where the chain of pushes does not reach the head. `unblock-prs` reads who pushed to a pull request failing only that check, and sets aside one only a bypass can merge (`checks-failed`) rather than re-running the check.
