---
'pr-report-core': minor
'pr-merge-queue': minor
---

Support a `CODEOWNERS` file enforced by a required check instead of the ruleset's `require_code_owner_review`. `codeOwnersEnforcedBy` reads the `# enforced-by: <context>` line, `codeOwnerGate` says which of the two enforces the file, and `codeOwnerReview`'s `authorApproves` and `ReviewRules.codeOwnerGate` count the author as approving the paths they own there. `unblock-prs` holds someone else's pull request until an owner approves it, re-runs the failed check after the approval, and its auto-fix no longer pushes a fix that changes a path `CODEOWNERS` owns.
