---
'pr-report-core': minor
'pr-merge-queue': patch
---

`pr-report-core` exports `REVIEW_SECTION_HEADING`, `CLAUDE_SESSION_LINE` and `isDeclarationLine`, so that `pr-description` guards a body with the patterns its parsers read it by rather than copies of them.
