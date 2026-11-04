---
'pr-merge-queue': patch
'pr-report-core': minor
---

`unblock-prs` ranks the runs of one job in one workflow and event by check suite, then by check run id, as `pr-report` does, rather than by when they started, and waits on a red required check while its own workflow run, with a job in it re-run after the red, has not finished. A queued re-run of a failed job, or the new round's queued aggregate, is waited on instead of losing to the red it replaces, and a pending commit status no longer counts as the start of a round. `pr-report-core` exports `outranks`, the ranking `statesFromCheckRuns` uses, and its `CheckRunRank` type.
