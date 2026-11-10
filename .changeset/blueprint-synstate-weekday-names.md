---
'blueprint-synstate': minor
---

`DatePicker` and `DateRangePicker`, and so `DateInput` and `DateRangeInput`, take `weekdayNames`: the seven heads of the weekday columns, Sunday first, in place of `Intl`'s short names (`Sun`). Blueprint draws date-fns's two letters (`Su`), which no `Intl` format gives; pass them to draw those. The full names read out stay `Intl`'s.
