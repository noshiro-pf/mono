---
'pr-merge-queue': minor
---

`run-issue-resolver` keeps its sessions out of each other's themes, and out of a `/resolve-issues` run's: an issue below `priority:S` whose primary themes (its title's scope, with the package that scope lives in) are those of a started issue, whoever claimed it, or of an issue started beside it, waits until they are free, and the log says which. The theme reading moved from `startable-issues` to `run-issue-resolver`, which both read it from.
