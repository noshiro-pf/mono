---
'pr-merge-queue': patch
---

`startable-issues --theme` no longer tells the caller to ask before taking a theme another session is on: its first line names the issues that session started, which are left to it, and the rest of the theme is listed to take without asking. The `resolve-issues` skill takes them so, instead of stopping on a question.
