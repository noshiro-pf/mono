---
'pr-merge-queue': patch
'pr-report-core': minor
---

`unblock-prs` reads which check runs carry the "command failed" annotation from the run GitHub answers for each name, through `pr-report-core`'s new `winningRuns`. `z:ci-job` prints that annotation as a notice, so that problem matchers spending a step's ten error annotations cannot drop it, and names the step that exited non-zero, a failed build included.
