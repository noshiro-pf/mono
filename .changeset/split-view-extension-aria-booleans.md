---
'split-view-extension': patch
---

Pass booleans to `aria-expanded` and `aria-pressed` as they are, rather than
converted to `"true"` / `"false"` first; what the extension draws is the same.
