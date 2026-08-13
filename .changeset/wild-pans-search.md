---
'ts-repo-utils': patch
---

Report non-`Error` throwables with `unknownToString` instead of `String`, so a
thrown object reads as its contents rather than as `[object Object]`.
