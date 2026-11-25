---
'eslint-plugin-ts-restrictions': minor
'eslint-config-typed': minor
---

Add `ts-restrictions/require-date-setter-day`, on in `eslint-config-typed`: a
call of `Date`'s `setMonth` / `setUTCMonth` without the day, or of `setFullYear`
/ `setUTCFullYear` without the month and day, keeps the day of the month, so a
day the target month lacks rolls into the next one (31 January set to February
is 3 March). The rule reads the callee through type wrappers and string keys,
counts `.call` and `.apply`, leaves a spread alone, and reports only `Date`'s
own methods.
