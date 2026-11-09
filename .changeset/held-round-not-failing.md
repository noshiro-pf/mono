---
'pr-merge-queue': patch
'pr-report-core': patch
---

A check cancelled by a newer run of its workflow no longer fails a pull request while that run waits on its concurrency group with no jobs: `unblock-prs` reads the head's runs of a red's workflow and counts one not finished as running, and `statesFromCheckRuns`, `reportedContexts` and `anyRunInProgress` take the commit's workflow runs, which `pr-report` passes, so that a newer round with no check run yet holds the red back as pending.
