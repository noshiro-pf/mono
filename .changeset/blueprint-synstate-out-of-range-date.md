---
'blueprint-synstate': minor
---

`DateInput` shows a value outside `minDate` to `maxDate` as its date, drawn as an error, where it showed "Out of range" as Blueprint's does. The range says what can be picked and typed; a value stored outside it, as Enter on a typed date or a saved document can give, still reads as itself, and changing the month in the calendar leaves it as it is. The input carries `aria-invalid` while it draws the error, for a value that is not a date too.

Breaking: `DateInput`'s `outOfRangeMessage` is removed, as nothing shows it any more. `DateRangeInput` keeps its own.
