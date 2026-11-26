---
'blueprint-synstate': minor
---

`DateRangeInput` shows a day outside `minDate` to `maxDate` as its date, drawn as an error, where it showed "Out of range" as Blueprint's does, as `DateInput` has since 0.12. A saved range that runs past the range still reads as itself, focused too until its text changes. Each field carries `aria-invalid` while it draws an error: a day out of range, text that reads as no date, and an end before the start.

Breaking: `DateRangeInput`'s `outOfRangeMessage` is removed, as nothing shows it any more.
