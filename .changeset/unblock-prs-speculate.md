---
'pr-merge-queue': minor
---

`unblock-prs` can check queued pull requests ahead of their turn. With `speculate` in `.github/unblock-prs.json`, it stacks up to `depth` of the leading candidates on the default branch, one commit each on a `queue/pr-<number>` branch, dispatches the listed workflows on each with the `diff-parent` input, and releases the first candidate once its layer is green, so that the gate reuses that verdict. A red first layer sets its pull request aside, unless only jobs a configured fixer settles failed, when it is released for the fixer to run; a red layer above the first waits until it is first, and the layers above a red one are dropped.
