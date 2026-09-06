---
'ts-std-forge': minor
---

Add the alternatives to the constructor-as-function calls that Tsubu forbids (D-15 / D-41):

- `SafeNumber.parse(value)` replaces `Number(str)`: the same implementation as ts-data-forge's `Num.safeParseFloat` (a copy, so the two can later be consolidated here), returning `Ok<number>` (finite) or `Err<{ kind: 'invalid-number', input }>` for blank input, trailing garbage, `NaN` and `±Infinity`.
- `SafeNumber.parseInteger(value)` replaces `Number.parseInt(str, 10)`: the same implementation as `Num.safeParseInt` plus a finiteness check (`'1e400'` is rejected instead of becoming `Infinity`), returning `Ok<number>` (an integer) or `Err<{ kind: 'invalid-integer', input }>`.
- `SafeString.fromPrimitive(value)` replaces `String(x)` for `string | number | boolean | bigint | symbol | undefined` — the last three cannot go in a template literal. It is total and returns `string`.
