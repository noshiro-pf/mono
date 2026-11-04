---
'synstate-dom': patch
---

`For`, `If`, `MatchOptional` and `MatchResult` follow a write from inside the row or branch they are mounting: a branch that writes the value that chose it, on its first mount or on a later switch, now leaves the branch for the latest value with one live scope, and a `For` row that writes `items` while it is mounted no longer leaves its key in two rows or the write unapplied.

A row or branch that keeps writing a value that chooses another one, so that the writes never settle, is an error after 100 of them.
