---
'pr-merge-queue': minor
---

Add `pr-description`, which reads and writes a pull request or issue description written in two languages: `read` leaves the translation out, and `push` (after `pull`), `create` and `check` refuse halves that do not mirror each other — headings, `#N` references, what may appear once — or an edit to one half alone. The heading the translation follows is `translation.heading` in `.github/unblock-prs.json`; with it set, `open-pr --body-file` checks the body the same way before pushing.
