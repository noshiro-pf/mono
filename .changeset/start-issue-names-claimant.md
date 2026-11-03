---
'pr-merge-queue': minor
'pr-report-core': minor
---

`start-issue` now says who started an issue. It takes `--by <claimant>` (a session URL, or any word unique to the claimant), which is required, and writes it into a claim comment beside the `in-progress` label. An issue someone else claimed is refused with their name and the time they claimed it. `--plan` labels an issue `planned` under a claim that lapses after 24 hours. `--release` takes either label off, and `--force` now goes with it to release someone else's claim. Two sessions starting one issue at the same moment no longer both get it: the claim is read back, and only the oldest one holds. `run-issue-resolver` claims under a name of its own for each run.

`pr-report-core` adds `issue-claim.mts` (`writeIssueClaimComment`, `parseIssueClaimComment`, `readIssueClaim`, `issueClaimApplies`, `PLANNED_CLAIM_LIFETIME_HOURS`) and exports `CLOCK_SKEW_MINUTES`.
