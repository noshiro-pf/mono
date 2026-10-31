---
'synstate-dom': minor
'blueprint-synstate': minor
---

A bound `checked` or `indeterminate` of an `<input>` is controlled. After a `change`, synstate-dom draws the input as its bound values again, before the next frame is painted, so a toggle the owner does not take in `onChange` no longer stays on screen. A change to a radio button sets back every bound button of its group, since the browser unchecks the others without an event. Every handler of the event, a delegated one on an ancestor included, still sees the user's change. For a checkbox the user toggles freely, use `defaultChecked`. `value` is not written back.

blueprint-synstate's `Checkbox` and `Radio` now stay as their `checked` when the owner refuses a change, and `RadioGroup` drops its own workaround for the same thing. blueprint-synstate now needs synstate-dom 0.5.0 or later.
