---
'pr-merge-queue': minor
---

`pr-description` and `open-pr --body-file` refuse a description whose translated review section (`### レビュー`) does not state the original's total of rounds on its first line, so that the halves do not drift apart when an amend adds rounds, and one whose `**Deferred**` line carries a finding itself instead of listing it as an item under the line, where `review-findings-digest` reads its reason.
