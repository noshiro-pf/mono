---
'pr-report-core': minor
'pr-merge-queue': minor
---

`pr-report-core` exports `pushersMatter` and `pushersOfActivityPage`, which `unblock-prs` decides by, so that the Pull Requests Manager reads who pushed to a branch where that can change where a pull request stands with the code owners. `pr-merge-queue` keeps exporting `pushersOfPage` as before, and its `pushersMatter` now comes from `pr-report-core`.
