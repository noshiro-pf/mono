---
'ts-fortress': patch
---

`attachConstraints`, `annotate` and the internal structure copy keep the
prototype of the type they are given, as `optional` and `required` already did,
so a `Type` whose members are inherited (one written as a class) keeps `is`,
`validate` and `fill` through them.
