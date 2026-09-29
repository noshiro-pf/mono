---
'split-view-extension': patch
---

Fix split views opened at the same time — with **↗ Open all** or the toolbar button — being forgotten as open for up to 30 seconds, during which opening them all again opened them a second time. Each tab now records itself under a key of its own, so tabs loading together no longer write over each other's records.
