---
'blueprint-synstate': patch
---

`DateInput` and `DateRangeInput` draw their popover with the code `Popover` and `Tooltip` use: Floating UI places it `bottom-start`, above the field where there is room there and not below, shifted to stay in the viewport, and the arrow and its transition are `Popover`'s. It is still drawn in place after the field and positioned `fixed`, so it keeps working inside a modal `<dialog>`. As Blueprint's, it is an overlay of its own while it is open: inside a `bp6-dark` element it carries `bp6-dark`, an enclosing `Dialog` or `Popover` does not hold the focus inside itself until the calendar closes, and an Escape pressed outside the calendar that nothing took, as with the focus on nothing in particular, closes the calendar and leaves the focus where it is. One in the calendar still gives the focus back to the field.
