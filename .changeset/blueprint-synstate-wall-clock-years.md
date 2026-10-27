---
'blueprint-synstate': patch
---

`daysInMonth`, `addDays` and `dayOfWeek` take a year below 100 as written.
They used to build their `Date` with `new Date(year, monthIndex, day)`, which
reads a year from 0 to 99 as 1900 to 1999, so `daysInMonth(0, 2)` said 28
where year 0 has 29. The calendar names (`calendarNames`) are unchanged.
