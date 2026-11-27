---
'ts-fortress': minor
---

`iso8601()`'s default value is now the Unix epoch, `1970-01-01T00:00:00.000Z`, instead of the moment its module was loaded. Pass `defaultValue` to keep another one. `iso8601` also rejects week 00 (`2010-W00-1`) in every mode, and with `strict: true` rejects week 53 of a year that has 52 ISO weeks (`2010-W53-1`).
