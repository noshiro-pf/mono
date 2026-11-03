---
'pr-merge-queue': minor
---

`pr-description` and `open-pr --body-file` also refuse a description with a trailer (a `Start-After:` or `Claude-Session:` line, or a closing keyword) inside either half instead of after the `---` rule, with more than one `## Review` section in the original, or with one in the translation. `pr-description push` does not count moving a trailer out of a half as an edit to that half.
