---
'ts-data-forge': minor
---

Adds `Json.parseWithReviver(text, reviver)`, which returns `Result<unknown, string>` and passes the reviver each value as `unknown`: with a reviver, `JSON.parse` returns whatever the reviver returned for the root (a `Date`, `undefined`, ...), and a parent's value holds what it already returned for the children. The form of `Json.parse` that takes a reviver, which types all of that `JsonValue`, is deprecated; the next major removes it.
