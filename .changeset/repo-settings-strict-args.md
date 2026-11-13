---
'github-settings-as-code': patch
---

`repo-settings` refuses a command line it does not understand — an unknown option such as `--dry-run`; `--owner` or `--repo` without a value or with an empty one; or a third argument — before anything is sent to GitHub, instead of ignoring it and applying anyway.
