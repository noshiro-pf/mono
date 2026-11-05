---
'blueprint-synstate': minor
---

Add `DateRangePicker` and `DateRangeInput`, showing one month, in Blueprint's markup. The picker draws the range picked and, while the pointer is over a day, the range a press there would make; the input opens it below its two fields, takes days typed and moves each end by the arrow keys, as Blueprint's does. `DatePicker` and `DateInput` take `shortcuts`, drawn in a menu before the calendar.

An overlay such as `Dialog` no longer closes on an Escape that a control in it has taken, as `DateInput` and `DateRangeInput` do to close their calendar.
