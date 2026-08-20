---
'ts-data-forge': minor
---

Add `Obj.filter` and `Obj.filterMap` for record transforms that drop entries.

`Object.fromEntries(Object.entries(record).filter(...))` loses the evidence that
the entries still describe the record they came from, so the result type can
only be rebuilt from the element type. Both new functions state the invariant
with a mapped type over `keyof R` instead:

- the surviving keys are the keys of the source record, made optional, because
  a predicate may reject any of them;
- a record keyed by an index signature stays **total** rather than becoming
  `Partial`. It names no specific key that could go missing, and
  `noUncheckedIndexedAccess` already adds `| undefined` on access, so `Partial`
  would only stop the result from being assignable back to the record type it
  came from;
- symbol keys are dropped, matching what `Object.entries` enumerates.

`Obj.filter` additionally narrows the value type when passed a type guard, so
`Obj.filter(record, isString)` yields a record of strings. `Obj.filterMap`
transforms and drops in one pass, using `Optional.some` / `Optional.none` rather
than `undefined` so that records whose values are legitimately `undefined` stay
expressible.
