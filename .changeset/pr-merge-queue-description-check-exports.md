---
'pr-merge-queue': minor
---

Exports `descriptionProblems`, which says why a description may not be posted
(what `pr-description check` refuses), with its `DescriptionKind`, and
`readConfig`, which reads `.github/unblock-prs.json`, so that a repository's own
checks can hold a pull request template to the shape `pr-description` accepts.
