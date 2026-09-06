---
'ts-std-forge': minor
---

Add the alternatives to the constructor-as-function calls that Tsubu forbids (D-15 / D-41):

- `SafeNumber.parse(value)` replaces `Number(str)`. It applies the same StringToNumber conversion, but reports a blank input or a `NaN` result as `Err<{ kind: 'invalid-number', input }>` instead of a sentinel; `±Infinity` still parses.
- `SafeString.fromPrimitive(value)` replaces `String(x)` for `string | number | boolean | bigint | symbol | undefined` — the last three cannot go in a template literal. It is total and returns `string`.
