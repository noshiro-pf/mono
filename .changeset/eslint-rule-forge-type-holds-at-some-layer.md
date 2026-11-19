---
'eslint-rule-forge': minor
---

Add `typeHoldsAtSomeLayer`, the counterpart of `typeHoldsAtEveryLayer`: whether
a check holds of the type of a node at some layer of its type wrappers, `false`
without type information. A cast changes the type and not the value, so this is
how a rule asks what the value may be (`b as unknown as number` is still a
bigint).
