---
'pr-report-core': minor
'pr-merge-queue': patch
---

Hold back the red of an earlier attempt while "Re-run failed jobs" runs its workflow run again, read from REST's `run_started_at` and shared by `unblock-prs` and `pr-report` (`isOfEarlierAttempt`, `readWorkflowRound`, `readWorkflowRounds`), for at most 40 minutes after the attempt began.
