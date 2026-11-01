# Next major

## Undecided

- Replace `'Thr'` with `'Thu'` in `DayOfWeekName`.

    The published union and its doc comment in `src/constants/int-enum.mts`
    spell Thursday `'Thr'`, and the global `DayOfWeekName` alias resolves to
    the same union. `Intl.DateTimeFormat('en-US', { weekday: 'short' })`,
    `Date.prototype.toUTCString()` and RFC 5322 / RFC 9110 dates use `'Thu'`,
    so records and guards built from `DayOfWeekName` do not accept standard
    weekday names. Consumers replace the `'Thr'` member with `'Thu'`,
    including object keys and string literals. Data already stored with
    `'Thr'` (persisted records, URLs) is not reported by the compiler and has
    to be mapped when it is read.

    What decides it: whether a major is being released for another reason.
    The spelling alone is not worth one.

    For this repository, not for the changeset: event-schedule-app migrates
    in the same change. `tsc` reports only the code typed through
    `DayOfWeekName`; the rest of the app declares its own `Thr` literals,
    and renaming it too keeps the app on one spelling.
    `grep -rlw Thr apps/event-schedule-app/src` lists every file. Keep the
    `'th'` value of `Routes.queryParamValue.dayAbbrDef`, so saved filter
    links keep working.
