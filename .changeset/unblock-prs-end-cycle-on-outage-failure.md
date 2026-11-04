---
'pr-merge-queue': patch
---

`unblock-prs` ends its cycle after a release failure GitHub may have caused — a refused push, a failed fetch, auto-merge that could not be armed, a label that could not be removed — instead of trying the next candidate. In an outage every candidate failed the same way, so the whole queue was set aside within one cycle, and nothing cleared the reasons once GitHub recovered. A failure that is the pull request's own (a real conflict, a stacked branch whose commits cannot be told, nothing left to merge) still moves on to the next candidate.
