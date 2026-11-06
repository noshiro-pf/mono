---
'eslint-config-typed': patch
---

`ts-restrictions/no-date-only-string-to-date` leaves alone `new Date` with more than one argument or a spread (`new Date(year, 10, 3)`), which reads numbers and parses no string; `Date.parse` and the callees named in `functions` are still checked whatever follows their first argument. It also sees a date-only literal behind an indexed access (`T['day']`, `T[K]`) as it does behind a type parameter, and stops at a template literal type, which is its own constraint.
