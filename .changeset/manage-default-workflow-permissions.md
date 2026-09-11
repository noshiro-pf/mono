---
'github-settings-as-code': minor
---

Manage Settings > Actions > General > Workflow permissions.

`ActionsSettings` gains `default_workflow_permissions` (`read` | `write`) and `can_approve_pull_request_reviews`, read from and written to `GET|PUT /repos/{owner}/{repo}/actions/permissions/workflow`.

That setting decides what a job's `GITHUB_TOKEN` can do when the job declares no `permissions` of its own, so leaving it outside the managed set left the most consequential Actions setting as the one nobody could see drift in: a repository can read as fully declared while every undeclared job holds a write-capable token.
