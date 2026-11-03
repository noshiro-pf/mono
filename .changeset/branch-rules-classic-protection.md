---
'pr-report-core': minor
'pr-merge-queue': minor
---

`pr-report-core` adds `readBranchRequirements`, which reads what GitHub requires of a branch — every ruleset that applies to it and the contexts a classic branch protection rule requires — through a transport the reader hands over. `unblock-prs`, and `pr-report` wherever it reads GitHub's rules rather than the checkout's `repo-settings/rulesets/main.json`, now read the required contexts through it, so a context required only by a classic branch protection rule is waited for rather than missed, and they ask for a hundred rules rather than GitHub's default page of thirty.
