---
'ts-std-forge': patch
'ts-data-forge': patch
---

`SafeNumber.parseInteger` (and `Num.safeParseInt`, which delegates to it) now accepts exactly what `Number` reads as a finite number, truncated toward zero, and its documentation says so. A leading-dot decimal such as `'.5'` or `'-.9'`, rejected before while `'0.5'` was accepted, now parses (to `0` / `-0`). The hexadecimal, binary and octal literals stay accepted, now documented rather than contradicting the "base-10" wording; `Num.safeParseInt`'s error message no longer says "base-10".
