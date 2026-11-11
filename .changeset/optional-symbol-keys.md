---
'ts-std-forge': minor
'ts-data-forge': major
---

The type-only properties that tell `Some` from `None` are keyed by `unique symbol`s from the new types-only package `ts-std-forge-keys`, which are declared and never defined, and exported as types only: no code names them by accident: an object literal that writes them out does not type-check as an `Optional`, and a property access does not read a `Some`'s value. (Spreading an existing Optional copies its type, not its runtime value; the type of the spread is not an Optional to trust.) Two copies of ts-std-forge that depend on the same version of `ts-std-forge-keys` declare the same `Optional`; that version moves only when the runtime encoding of an Optional does, so copies that would read each other's Optionals wrongly also declare types that are not assignable to each other.

A package that compiles declarations names an Optional by its type (`Some<1>`, `Optional<number>`). Where its declaration emit would have to spell an Optional's properties out (the spread of an Optional, or a mapped type over one that TypeScript expands), it fails with TS4023, since the keys cannot be named from that package; annotate the declaration's type.
