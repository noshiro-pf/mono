---
'pr-merge-queue': patch
---

`rework-pr start`, refused making the pull request a draft, now says the draft is still to be made and how: the GitHub MCP tool `update_pull_request` with `draft: true`, or the pull request's page. `rework-pr done`, refused marking it ready, names the same ways with `draft: false` and says that running it again finishes it.
