---
'ts-codemod-lib': patch
---

`convertToReadonlyTransformer` leaves a type literal with a property typed `unique symbol` unwrapped, marking its members `readonly` one by one, and never takes that property's `readonly` off: `Readonly<{ tag: unique symbol }>` is rejected by TypeScript (TS1330).
