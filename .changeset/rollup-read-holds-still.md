---
'pr-merge-queue': patch
---

`unblock-prs` reads a head whose checks take more than one page until two reads list the same checks, and fails the read if they never do, so that a pending check skipped between two pages no longer makes a round look over.
