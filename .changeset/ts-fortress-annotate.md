---
'ts-fortress': minor
---

Add `t.annotate(type, { title, description, format, examples, deprecated })`, which gives a type annotations for its JSON Schema without changing what it validates, and readable at runtime as `type.annotations`. `toJsonSchema` writes them under the keywords of the same names, and reports an example the type does not accept as an `'invalid-example'` error. `t.uuid()` now carries the `uuid` format.
