---
'pr-merge-queue': minor
---

`unblock-prs` declines an auto-fix at planning, naming the job, when the failed job's check run carries the annotation `autoFix.notFixableAnnotation` names: a job says so when its command failed rather than only leaving a diff. Without the setting, every failed context matching a fixer is tried as before.
