---
'pr-merge-queue': minor
---

`pr-report` says when the issues linked to an open pull request by hand could not be read, or were cut short at a hundred, instead of reporting the closing keywords alone as the whole list: the report names those pull requests at the bottom with what GraphQL answered, `--format json` carries them as `handLinks`, `startable-issues` adds the same notes after its list, and `run-issue-resolver` logs them on each look for an issue. A GraphQL refusal for its own rate limit no longer stops the report with advice to set a token. `Client.facts` now resolves to `{ pulls, handLinks }`.
