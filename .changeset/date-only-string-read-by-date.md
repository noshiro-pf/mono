---
'eslint-config-typed': minor
---

New rule `ts-restrictions/no-date-only-string-to-date`, on as `error` in the preset: it reports an ISO date-only string — `'YYYY'`, `'YYYY-MM'` or `'YYYY-MM-DD'` — given to `new Date` or `Date.parse` (`globalThis.Date` and `Date['parse']` included). `Date` reads such a string as midnight UTC, not local midnight, so the local getters (`getDate`, `getMonth`, …) give the day before wherever the offset is negative. Build the date from its numbers, or write the time and zone (`'2026-11-03T00:00:00Z'`) when UTC is meant.

The argument is judged by its type, so a literal at the call, a `const` holding one and a row of an `as const` table are reported, and a `string` is not. The argument and the callee are read through `as`, `satisfies`, `!` and `<T>`. The `functions` option names further callees, called or constructed, that pass their first argument to `new Date`, as dotted paths such as `'DateUtils.from'`.
