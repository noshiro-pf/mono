---
'pr-merge-queue': patch
---

`unblock-prs` reads the order it releases in wherever it reads an order: the survey log's "next" and its list, which marks a pull request kept ahead by its stacked layer, `--dry-run`'s "Would …", and the settling of a double release just after one (`firstInReleaseOrder` takes that order first). The layer branches are read once a survey.
