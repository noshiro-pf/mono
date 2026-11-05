---
'pr-merge-queue': patch
---

`open-pr --merge-before N` refuses a cycle against the `Merge-After:` of the pull request's body as the run leaves it, not only against what the run declares: the body of a pull request open already, and the order carried from the `Start-After:` of the issues it closes, are now checked before `N`'s body is written. Such a run stops with nothing written into `N`, after `skip-ci` and `auto-rebase` are on.
