---
'pr-merge-queue': patch
---

`unblock-prs` no longer sets a pull request aside as checks-failed because of a red check left over from the round before, when some job of the new round is still queued and another one has already started. A queued check has no start time. It used to get a placeholder that read as year 1, which made the round look as if it began before every red check. While every job is still queued the round has no start time to compare against, and a red is judged, as before, only by whether its workflow has a newer run.
