---
'blueprint-synstate': minor
---

`NumericInput` clamps a committed number to its `min` and `max` before `normalize`, and a step stops at them, so one pair of bounds is both what is enforced and what assistive technology reads out. `normalize` no longer needs its own clamp; it is given `NaN` as it is.

A caller that passed `min` and `max` only for the readout, and let `normalize` commit numbers past them, now has those numbers clamped.
