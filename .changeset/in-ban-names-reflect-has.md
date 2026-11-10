---
'eslint-config-typed': patch
---

The `restrictedSyntax` entry that bans the `in` operator now names `Reflect.has` beside `Object.hasOwn`, and no longer reports a private brand check (`#field in obj`). `Object.hasOwn` answers `false` for a property inherited through the prototype chain (a method, a DOM accessor, a Promise's `then`), and neither function can name a private field, so the old message offered no replacement for those checks.
