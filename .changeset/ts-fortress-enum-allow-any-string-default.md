---
'ts-fortress': patch
---

`enumType(values, { allowAnyString: true })` without a string `defaultValue` now accepts any string, as its type says: it accepted only the listed members, and `fill` replaced any other string with the first, while with a string `defaultValue` it already accepted any string. Given a `defaultValue` or not, it is now a string type with the structure `{ kind: 'string' }`, so `toJsonSchema` writes `{ type: 'string' }` rather than an `enum` of the members, and its default is the first member unless a string is given.

Its validation errors change with it. Without a string `defaultValue`, an error had the details `{ kind: 'enum', values }` and the message `expected one of { red, green } but …`; it now has no details and the message `expected <string> type but …`, with a given `typeName` in place of `string`. Without a `typeName` either, its `typeName` was `enum` and is now `string`. With a string `defaultValue`, a given `typeName` is now kept, in `typeName` and in the messages, where both said `string`. It no longer carries the `constraints` record, all of whose entries were unset, that it had with a string `defaultValue`.

Any other `enumType` takes a `defaultValue` of `null` or `undefined` when the enum lists it, where the first member replaced it. A `defaultValue` it does not list that is neither `null` nor `undefined`, which only a value past the types can be, is now replaced by the first member, where it was kept as given, so that `defaultValue` and `fill` always satisfy `is`. An unlisted `null` or `undefined` was replaced already.

Every `enumType` now reads a `defaultValue` given in `options` exactly once, when the type is built. A getter that supplies it runs once and throws, if it throws, from `enumType` itself; before, it could run more than once, or not until the default was first needed, and a change to `options` made before then reached the type.
