---
'ts-std-forge': minor
---

Reach the wrapper modules through their namespace only (BREAKING).

`Regex`, `SafeDate`, `SafeNumber`, `SafeString` and the new `SafeArray` no
longer re-export their contents at the package's top level, so the bare
`create`, `toISOString`, `parse`, `parseInteger`, `toExponential`, `toFixed`,
`toPrecision`, `toStringWithRadix`, `fromCodePoint`, `fromPrimitive`,
`normalize` and `repeat` — and the failure types beside them (`CreateError`,
`ParseError`, `RepeatError`, …) — are gone. Import the namespace instead:

```ts
// before
import { repeat } from 'ts-std-forge';
// after
import { SafeString } from 'ts-std-forge';
SafeString.repeat('ab', 3);
```

`SafeString.repeat(s, 3)` was already the documented spelling and the only one
used in this repository; the bare names were a by-product of the barrels being
generated. They also collide: `Regex.create` and `SafeArray.create` are both
`create`, which `export *` reports as TS2308 rather than resolving — the
reason `SafeArray` shipped namespace-only, now applied to all five.

The guards (`isRecord`, `hasKey`, …), the ADT core (`Result`, `Optional`,
`pipe`, `match`, …), `panic` and `unknownToString` are unaffected: they have no
namespace to sit under and keep their bare names.
