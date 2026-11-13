---
'eslint-rule-forge': minor
'eslint-plugin-ts-data-forge': minor
'eslint-plugin-ts-std-forge': minor
---

`prefer-is-record-and-has-key` (built by `createPreferIsRecordAndHasKey`) reports `Reflect.has(obj, key)` where `obj` is typed as a plain record (`Record<string, …>`), and fixes it to `hasKey(obj, key)`; a literal key naming a member of `Object.prototype` (`'toString'`) gets a suggestion instead, since `Reflect.has` finds it there and `hasKey` does not. On any other object — a class instance, an interface, a built-in, a function, `object` — `Reflect.has` is left alone. `Object.hasOwn` is no longer reported where `Object` is a value the file binds itself (a parameter, a variable, an import), nor as a computed member (`Object[name](…)`).
