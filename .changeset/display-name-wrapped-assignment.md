---
'eslint-config-typed': patch
---

`react-coding-style/display-name` now accepts a `displayName` assignment wrapped in a type wrapper (`(C.displayName = 'C') satisfies string;`), which it used to report as missing.
