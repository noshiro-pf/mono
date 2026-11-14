---
'ts-fortress': patch
---

`t.string(defaultValue, { regex })` gives the same answer for the same value whatever flags the regex has. A regex with the `g` or `y` flag used to be tested from the `lastIndex` the previous call left, so `is` could return `false` for a matching value (with `/a/g` and the default `'ab'`, every `is('ab')` did). The value is now searched from index 0 and the regex's `lastIndex` is left as the caller set it; a sticky regex still has to match at index 0.
