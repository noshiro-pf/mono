---
'blueprint-synstate': patch
---

Open a `Tooltip`, and a `Popover` opened by hovering, when its target takes keyboard focus, and close it when the focus leaves, as the README says. The target listened for `focus` and `blur`, which do not bubble from the element inside it that takes the focus. As in Blueprint, the page getting the focus back with the target still focused does not open it again.
