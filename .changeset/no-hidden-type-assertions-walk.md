---
'eslint-config-typed': patch
---

`total-functions/no-hidden-type-assertions` finds a type parameter under every kind of type node — parentheses, type predicates, rest and optional tuple elements, mapped, constructor, template literal and `typeof` types, and the parameters of method and call signatures — and no longer counts a shadowing type parameter of the same name as a use. A generic type guard whose type parameter only its predicate uses (`<T>(x: unknown) => x is T`, or `asserts x is T`) is now reported when called with a type argument other than `unknown` or `never`, or with none.
