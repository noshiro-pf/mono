---
'pr-merge-queue': patch
---

`unblock-prs` re-fires the check workflows once before it sets a released pull request aside as `checks-not-started`: after five minutes with a required context unreported and nothing running on the head, it puts `skip-ci` back on and takes it off, which every check workflow triggers on, and waits five minutes more. The set-aside clears only when `main` moves, so when that pull request was the only one the worker could release, the queue used to stay stalled until a person moved it.
