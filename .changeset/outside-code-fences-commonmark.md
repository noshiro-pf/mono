---
'pr-report-core': patch
---

`outsideCodeFences`, and with it `parseMergeAfter` and `parseStartAfter`, now closes a fenced code block the way CommonMark does: only on a run of the opening character at least as long as the opener, with nothing after it. Every fence line used to toggle the block, so a ` ``` ` line inside a ` ` ```` or `~~~` block ended it, and a sample `Merge-After:` or `Start-After:` after it was read as a real declaration. A backtick line whose info string holds a backtick no longer opens a block either.
