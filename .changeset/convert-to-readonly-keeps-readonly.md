---
'ts-codemod-lib': patch
---

`convert-to-readonly` no longer breaks or weakens `Readonly<...>` over a union or intersection.

- `Readonly<A & { b: string }>[]` and `readonly Readonly<A & { b: string }>[]` no longer stop the run with "Error replacing tree!" when the `Readonly` is taken off: what replaces it keeps the parentheses its position needs.
- A member such as a type parameter or an alias stays under the `Readonly` it was written under, so `Readonly<A & B>` is no longer rewritten into a mutable `A & B`.
- `Readonly<A> & Readonly<B>` is merged into `Readonly<A & B>` only when `A` and `B` are known to be object types: type literals, or mapped types that do not map over `keyof T`. `Readonly<string[] & X>` leaves the array mutable, so merging a type parameter or an alias that may be an array removed the readonly-ness the codemod is meant to add. Unions are merged as before.
