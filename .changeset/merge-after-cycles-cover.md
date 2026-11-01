---
'pr-report-core': patch
---

`findMergeAfterCycles` now puts every number that lies on a cycle into at least one reported cycle. Its depth-first walk skipped nodes it had finished, so a node whose only way back into a cycle ran through one was missed: with #1 after #2 and #3, #2 after #1 and #3 after #2, #3 was left out, and the tree, the queue order and the issue start states treated it as off any cycle. Each entry is now the shortest cycle through the first number no earlier entry covers.
