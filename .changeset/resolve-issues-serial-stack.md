---
'pr-merge-queue': minor
---

The `resolve-issues` skill stacks every pull request of a run serially, in the order it takes the issues, even where their paths are disjoint and nothing orders them, and no longer defers to the repository's own instructions on how several pull requests relate, so the whole stack can be queued as it stands and its layers merge without conflicting with each other.
