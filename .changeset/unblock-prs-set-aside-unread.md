---
'pr-merge-queue': patch
'pr-report-core': minor
---

`unblock-prs` no longer holds the queue for good behind a released pull request whose checks (or, for the version pull request, whether it was rebuilt on the tip) cannot be read. Unread at the same head for five surveys in a row, it is set aside as the new `read-failed` reason, with what failed, and the queue moves on — unless the same kind of read fails for the tip of the base too, which is GitHub failing rather than the pull request, and holds the queue instead. The log says which read failed. `pr-report-core` adds `read-failed` to `SET_ASIDE_REASONS`, owned by a person.
