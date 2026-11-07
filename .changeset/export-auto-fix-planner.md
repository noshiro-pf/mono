---
'pr-merge-queue': minor
---

`pr-merge-queue` exports `ConfigFileSchema`, `configOf`, `failedContexts`, `firstFixerOf` and `planAutoFix`, so that a repository's guard can ask `unblock-prs` what a pattern in its configuration takes rather than restate the rules.
