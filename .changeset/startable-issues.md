---
'pr-merge-queue': minor
---

Add `startable-issues`, which lists the open issues nobody has started in the order `run-issue-resolver` would hand them on — the same survey, `priority:high` first and `priority:low` last, the lowest number first within each — and says which startable ones it passed over and why. It writes nothing; `--limit` lists the first few and `--author` names whose issues it lists.

Add the `resolve-issues` skill to the Claude Code plugin: `/pr-merge-queue:resolve-issues N` goes down the issues `startable-issues` lists, passing over any that one pull request cannot finish, and takes the others one at a time until N pull requests are open: `start-issue` as it takes one, then its own pull request opened with `open-pr`.
