---
'split-view-extension': patch
---

The rule that lets a page open in a pane is rewritten on every install and update. It is a dynamic rule, which survives an update, and an older build's rule was kept as it was, so a pane could stay empty on a site the current version opens.
