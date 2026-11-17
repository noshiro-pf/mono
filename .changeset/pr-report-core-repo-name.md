---
'pr-report-core': minor
'pr-merge-queue': patch
---

Add `isRepoNamed`, `isRepoApiUrl`, `isSameRepo` and `readIssueNumber`: whether a name or API URL GitHub gave back is a repository, compared without case as GitHub compares it, and the issue number a reference spells. `pr-report` no longer reports every pull request as from a fork when the repository is named in another case than GitHub's.
