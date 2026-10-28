# blueprint-synstate

## 0.1.1

### Patch Changes

- aa96a22: `daysInMonth`, `addDays` and `dayOfWeek` take a year below 100 as written.
  They used to build their `Date` with `new Date(year, monthIndex, day)`, which
  reads a year from 0 to 99 as 1900 to 1999, so `daysInMonth(0, 2)` said 28
  where year 0 has 29. The calendar names (`calendarNames`) are unchanged.
- synstate@6.0.0
    - synstate-dom@0.3.0
    - ts-data-forge@14.10.0
