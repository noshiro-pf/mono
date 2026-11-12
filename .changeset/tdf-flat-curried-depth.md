---
'ts-data-forge': patch
---

The curried form of `Arr.flat` is typed by its depth, as the direct form is: `Arr.flat(2)(nested)` has the type of `Arr.flat(nested, 2)` (it was typed as if flattened once, and `Arr.flat(0)(xs)` as flattened once too). The curried form now takes the depth as a `SafeUint` or a small literal, as the direct form does; a plain `number` is converted with `asSafeUint`.
