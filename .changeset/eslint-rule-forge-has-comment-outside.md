---
'eslint-rule-forge': minor
---

Add `hasCommentOutside(sourceCode, node, keptRanges)`: whether a comment inside `node` lies within none of the ranges a fix replacing `node` copies verbatim, and so would be dropped by it.
