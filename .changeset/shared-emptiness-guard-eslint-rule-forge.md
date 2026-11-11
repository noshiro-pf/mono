---
'eslint-rule-forge': minor
---

Add `createPreferEmptinessGuard`, which rewrites a comparison of an array's length that only asks whether it is empty (`xs.length === 0`, `<= 0`, `< 1`, `!== 0`, `> 0`, `>= 1`, in either operand order) to `<namespace>.isEmpty(xs)` / `<namespace>.isNonEmpty(xs)`, and `matchEmptinessComparison`, which recognizes those comparisons. Every factory now records itself on the rule it builds: `ruleFactoriesOf(rule)` reads it, and `composedOf(parts, rule)` marks a rule that merges the visitors of others, so that two plugins can check that their counterpart rules share an implementation.
