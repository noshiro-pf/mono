---
'eslint-config-typed': patch
---

`eslintConfigForPreact` now lets `react/no-unknown-property` accept `tabindex` and `onDblClick`, the names Preact needs. Preact writes a prop to the DOM under the name it is spelled with, so `tabIndex` on an SVG element becomes an attribute browsers do not read as `tabindex`, and `onDoubleClick` listens for an event that never fires; the rule used to ask for exactly those spellings. The `css` prop the base config allows stays allowed.
