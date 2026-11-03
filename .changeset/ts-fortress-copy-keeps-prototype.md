---
'ts-fortress': patch
---

`annotate`, `attachConstraints` and the types built with a replaced `structure` keep the prototype of the type they copy, as `optional` and `required` already did, so a `Type` whose methods are inherited through its prototype keeps them: `t.annotate(t.optional(Object.create(t.number(0))), { title: 'x' }).is` is a function again.
