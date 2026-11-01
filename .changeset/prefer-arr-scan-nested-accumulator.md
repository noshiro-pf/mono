---
'eslint-plugin-ts-data-forge': patch
---

`prefer-arr-scan` no longer reports a `reduce` whose array-literal body holds the bare accumulator, such as `xs.reduce((acc, x) => [acc, x], seed)`. That body nests the accumulator rather than copying it, so the rule's message was wrong and it offered no fix; only `[...acc, …]` counts as rebuilding the accumulator.
