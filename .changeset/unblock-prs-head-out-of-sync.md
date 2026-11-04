---
'pr-merge-queue': patch
'pr-report-core': minor
---

`unblock-prs` no longer stalls the whole queue behind a pull request whose last push GitHub dropped, leaving its head, `refs/pull/<n>/head` and merge state behind its branch. A branch found at another commit before the rebase was always read as someone else pushing, so the cycle surveyed again, picked the same pull request, and never reached the next. The same mismatch still there ten minutes later now sets it aside as the new `head-out-of-sync` reason, with both commits, and the next candidate is tried; while it stays aside, its `UNKNOWN` merge state no longer makes every survey re-list. `pr-report-core` adds `head-out-of-sync` to `SET_ASIDE_REASONS`, owned by a person and not cleared by the base moving.
