---
'pr-merge-queue': minor
'pr-report-core': minor
---

Place every issue in one priority tier. `pr-report-core` reads the `priority:S`, `priority:A`, `priority:B`, `priority:C`, `priority:D`, `priority:hold` and `priority:close` issue labels (`issuePriorityOfLabels`, `issueStartRank`). `pr-description create` needs `--priority <tier>` and refuses while an open issue has a close title, unless each is named with `--not-duplicate`; the new `pr-description similar` lists the open issues a new one may repeat. `run-issue-resolver` takes issues by tier and leaves `priority:hold` and `priority:close`, `pr-report` names an issue with no tier or several, and `report-unowned-prs` files its issues under `priority:A`.
