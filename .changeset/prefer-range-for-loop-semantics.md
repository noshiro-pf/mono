---
'eslint-plugin-ts-data-forge': patch
---

`prefer-range-for-loop` no longer rewrites a loop into one that `range()` runs differently without the type checker noticing. A loop that assigns its variable anywhere but in the update, whose begin or step is a number literal that is not a safe integer (`i += 0.5`), or whose step is a negative literal (`i += -1`, which never reaches the end), is not reported. A loop whose end or step is not a literal or a never-reassigned variable (`i < xs.length`, `i < getN()`, a `step` the body doubles) is reported without a fix: the loop reads them on every iteration, while `range` reads them once. Whether a variable begin, end or step is a safe integer is left to the type checker: when it is not, the fixed call fails to type-check.
