---
'ts-fortress': patch
---

`toJsonSchema` leaves a union member out only when no JSON value is of it — a `bigint`, `symbol`, `undefined`, `Map` or `Set`, a literal or enum of no JSON value, a union, intersection, brand, refinement or recursion of one, or a record, tuple or non-empty array that requires one. A member with such a part that may be left out (an optional `bigint` property, an array of `bigint` that may be empty) or with an example that is not JSON is now an error, as it is outside a union, where it used to be dropped silently and leave a schema that rejects JSON values the type accepts. An error inside a union member now points at where it is, below the member (`/anyOf/0/properties/big`, or `/items` when the member is the only one left), rather than at the member.
