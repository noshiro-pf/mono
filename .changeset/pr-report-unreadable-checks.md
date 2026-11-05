---
'pr-merge-queue': patch
---

`pr-report` fails, naming each pull request and what failed, when the check runs or the commit statuses of a pull request cannot be read, as it does when the rate limit is spent. It used to read such a failure as nothing reported, so every required context of that pull request came out `missing` and its verdict `pending`, as if CI had not started.
