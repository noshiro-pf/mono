---
'pr-merge-queue': minor
---

`pr-description` and `open-pr --body-file` refuse a `## Review` section whose
first line does not state the level and the total of rounds in digits, in one of
these forms:

```md
`/code-review high`, 3 rounds.
Review at `high`, 2 rounds.
Self-review at `high`, 1 round.
```

`reviewOpeningOf` picks a section's opening line and `reviewOpeningRounds` reads
the total from it.
