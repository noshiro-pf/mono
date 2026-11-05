---
'blueprint-synstate': patch
---

`createToaster` adds its `div` to the container with the first toast shown rather than as it is made, so a toaster that never shows a toast leaves nothing in the page. `remove` now also drops its toasts and those waiting to be shown, and a toast shown after it is ignored.
