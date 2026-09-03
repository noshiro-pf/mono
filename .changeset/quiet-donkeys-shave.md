---
'ts-fortress': minor
---

Constrained types now carry the constraints they were created with, so the values a schema validates against can drive a form instead of being written down a second time.

- `t.string`, `t.number` and `t.bigint` expose a `constraints` property. Every constraint key is present, so one that was specified is read without `?.` and at the literal type it was given (`t.number(0, { max: 120 }).constraints.max` is `120`), while one that was not is typed `undefined`.
- `t.refine` and `t.brand` carry the base type's constraints over, and so do the branded constructors built on them (`t.int`, `t.uint`, `t.nonEmptyString`, ...). Wrapping a type that carries no constraints adds no `constraints` property.
- `t.record` and `t.strictRecord` expose the shape they were built from as `.shape`, and `t.at(recordType, key)` returns that member type — constraints included. An optional member widens to `T | undefined` and still carries its constraints.
- The internal bound behind `TypeOf` and the `union` / `tuple` / `intersection` / shape element positions is now plainly `Type<unknown>` (renamed `UnknownType`) rather than a `Type<any>`. It stays unexported — `Type<unknown>` says the same thing and a caller can write it directly. The `any` was absorbing three genuinely unsound spots inside `valueof` and `union`, which are now explicit assertions at the lines that need them; the bound itself no longer silently accepts whatever is handed to it.
- New exports: `ConstraintsOf`, `ConstrainedType`, `WithConstraints`, `NoConstraints`, `NumberConstraintsOf`, `StringConstraintsOf`, `BigintConstraintsOf`, `BigintTypeConstraints`, `UnknownShape`, `WithShape`, `attachConstraints` and `hasConstraints`.
