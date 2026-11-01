---
'pr-merge-queue': patch
---

`report-unowned-prs` now reads every page of the open issues and pull requests the token's account wrote before deciding whether a pull request nobody owns has been reported. It read only the newest 100, so once the account had more open, a report older than that was not seen and the same issue was filed again on every run. The new `restAllPages` helper reads a list endpoint page by page until a short page.
