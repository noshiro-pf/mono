---
'pr-merge-queue': patch
---

`open-pr` refuses, before pushing, a run whose `--base` differs from the base of the pull request already open for the branch, instead of reporting it stacked while it still targets the old base, and one that names that pull request in its own `--merge-after` or `--merge-before`. Without `--base`, the open pull request's base is used, so a stacked one stays stacked. On a pull request opened earlier it writes the `Merge-After:` the run declares that the body does not name yet, says that `--title` and `--body-file` are not applied, and `--dry-run` and the final message say what is done for it.
