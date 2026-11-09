---
'blueprint-synstate': patch
---

A controlled `Popover` whose target opens it in its own click handler stays open: the target's click toggles from the state the popover had as the click began, as Blueprint's does, rather than closing it again.
