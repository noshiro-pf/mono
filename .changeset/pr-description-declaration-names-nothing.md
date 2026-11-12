---
'pr-merge-queue': patch
---

`pr-description` (and so `open-pr --body-file` and `pr-description create`) refuses a `Merge-After:` or `Start-After:` line that names no `#N`, such as `Start-After: 3877` or one naming only a URL or `owner/repo#N`, and a line meant as a declaration that the readers do not take as one: its key behind a list marker or emphasis (`**Start-After:** #5`, `- Start-After: #5`), or emphasis between the key and its colon. Each was a description that meant an order and declared none. The trailers after the `---` rule are checked too, and so is a description in a repository with no `translation.heading`, where `pr-description check` now checks this rule alone instead of stopping. A quote, inline code, a heading, link text, strikethrough, a full-width colon and a flag such as `--merge-after` are left alone.
