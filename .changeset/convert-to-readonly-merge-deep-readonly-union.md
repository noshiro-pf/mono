---
'ts-codemod-lib': minor
---

`convert-to-readonly` now merges the `DeepReadonly` members of a union, as it
already did for `Readonly`: `DeepReadonly<A> | DeepReadonly<B>` becomes
`DeepReadonly<A | B>`. The merged member takes the place of the first one, and
the configured `DeepReadonly.typeName` is honored. An intersection is left as
written, because `DeepReadonly` is a distributive conditional type and does not
commute with `&`.
