---
'ts-codemod-lib': patch
---

`convert-to-readonly` normalizes two more redundant spellings, neither of which changes the type:

- `Readonly<DeepReadonly<X>>` becomes `DeepReadonly<X>`, using the configured `DeepReadonly.typeName`.
- When `Readonly` members of a union are merged, a union argument is spliced in without parentheses: `Readonly<A | B> | Readonly<C>` becomes `Readonly<A | B | C>` instead of `Readonly<(A | B) | C>`. The same holds for an intersection argument in an intersection.
