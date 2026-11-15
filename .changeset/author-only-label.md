---
'pr-report-core': minor
'pr-merge-queue': minor
---

Add the `author-only` issue label (`AUTHOR_ONLY_LABEL`), for an issue only the repository's author can do. `run-issue-resolver` and `startable-issues` hold an issue carrying it back whatever its `priority:<tier>`, so that it keeps the tier it would have and no session is handed it.
