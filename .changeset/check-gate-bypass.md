---
'pr-merge-queue': patch
---

Under a required check that enforces `CODEOWNERS`, `unblock-prs` sets an owner's pull request that someone else pushed to, whose only owner is its author, aside `awaiting-bypass` once its other required checks are green, asking for the bypass merge as it does under the ruleset's code-owner review, instead of `checks-failed`. It holds it while those checks still run.
