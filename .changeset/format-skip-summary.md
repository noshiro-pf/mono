---
'ts-repo-utils': patch
---

`format` now reports skipped files as a count rather than a line each. A
repository can hand it thousands of files it will not touch — a subtree
formatted by another tool, or a first diff that contains a whole imported
directory — and naming every one is both unreadable and enough output to
overflow the stdout buffer of a parent process capturing the run.
