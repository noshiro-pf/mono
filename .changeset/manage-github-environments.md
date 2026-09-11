---
'github-settings-as-code': minor
---

Manage Settings > Environments.

A new `environments` target covers `repo-settings/environments/*.json`, one file per environment, alongside the existing `repository` / `rulesets` / `actions` / `pages` ones. `applyEnvironments` and `backupEnvironments` are exported, and `apply`/`backup` with no target now include them.

Each file is the whole of one environment: the wait timer, the self-review setting, the required reviewers, the deployment branch policy selection, and — folded in from the separate endpoint GitHub keeps them on — the branch and tag patterns that selection refers to. Splitting those two apart would leave a file that reads as a restriction while restricting nothing, so `apply` rejects patterns written under a selection that does not use them, and rejects `protected_branches` and `custom_branch_policies` set together.

Patterns are reconciled rather than replaced: one whose name and type already match is left alone, because deleting and re-creating it changes its id and leaves a window in which the ref it names cannot deploy.

Reading an environment back means reading GitHub's `protection_rules`, whose elements are typed as a bare `string` discriminant upstream and so cannot be narrowed. They are parsed with `ts-fortress` instead of cast, which fails loudly if the shape moves.
