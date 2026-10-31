---
'blueprint-synstate': minor
---

Markup now matches Blueprint React's where a test compares the two:

- `NumericInput` and `NumericInputView` carry the ARIA Blueprint's do: `role="group"` on the wrapper, `role="spinbutton"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow` on the input, and `aria-controls` on the buttons. `NumericInputView` takes `min`, `max` and `aria-valuenow` for them, and `NumericInput` reads out the number its text shows as it is typed, as Blueprint's does, so its `decode` is now read whenever the text changes and has to take half-typed text without throwing; the inner input group no longer carries `bp6-fill`.
- `TimePicker` draws its arrow rows without `showArrowButtons` too, empty, as Blueprint's does.
- `DatePicker`'s grid is labelled by its caption.

`TimePicker`, `DateInput` and `NumericInput` ignore the keys that pick, confirm or cancel what an input method is composing, Safari's after `compositionend` included.
