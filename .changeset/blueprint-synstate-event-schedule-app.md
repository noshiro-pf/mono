---
'blueprint-synstate': minor
---

Add what event-schedule-app needed in moving off Blueprint React: `iconElement` on `Button` and `AnchorButton` for an icon of the app's own; `color`, `intent` and the 12 and 28 pixel sizes on `Icon`; `inputRef` on `InputGroup`; `reverseMonthAndYearMenus` on `DatePicker`; `shortcuts` on `DateInput` given as a function, made again each time the calendar opens; `vertical` on `ButtonGroup`; `maxLength` on `TextArea`; and `data-e2e` on each `TagInput` value, put on its tag.

`InputGroup` with `autoFocus` takes focus as it is drawn, at any time, as React's `autoFocus` does; the attribute alone is honoured once per page.

An overlay such as `Dialog` writes its transition phase after the update that opened or closed it, not during it, so opening one no longer has synstate warn of a write while an update propagates.
