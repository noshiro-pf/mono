---
'pr-merge-queue': minor
---

`startable-issues` orders the startable issues by theme — the scope a title starts with and the packages its body names by path, shown in braces on each line. With no theme named, every `priority:S` comes first, then the highest-tier issue left with the rest of its theme whatever their tier, then the next; an issue below `priority:S` whose theme another session has started on is left out and named at the end (`--by <claimant>` keeps the caller's own started issues from counting). `--theme <name>` lists that theme alone (`synstate` takes `synstate-dom` too), its own `priority:S` first. The `resolve-issues` skill takes a theme as its second argument (`/resolve-issues 20 synstate`) and passes its claimant to `startable-issues` and `start-issue`.
