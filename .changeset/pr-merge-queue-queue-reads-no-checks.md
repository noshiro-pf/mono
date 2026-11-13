---
'pr-merge-queue': patch
---

`startable-issues`, `run-issue-resolver`'s survey of the issues, `claim-pr`, `push-fixed-pr`, `report-unowned-prs` and `run-unblock-prs-skill` no longer read every open pull request's comparison, check runs, workflow runs and commit statuses, about four requests each, or the contexts the default branch requires, which none of them used: with fifty open pull requests that was over two minutes before any of them said anything. `readQueueState` now leaves them out unless called with `checks: true`. Without it, its queue requires no context and its entries' check verdicts and comparisons mean nothing, while the owners it returns are the same either way. `pr-report` reads them as before.
