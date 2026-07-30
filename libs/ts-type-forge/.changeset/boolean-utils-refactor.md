---
'ts-type-forge': patch
---

Define the negated condition types in terms of their positive counterparts
instead of re-spelling the underlying trick, and `IsNever` in terms of
`TypeExtends`:

| type                      | before                                      | after                           |
| :------------------------ | :------------------------------------------ | :------------------------------ |
| `IsNotAny<T>`             | `0 extends 1 & T ? false : true`            | `BoolNot<IsAny<T>>`             |
| `IsNotUnknown<T>`         | `IsUnknown<T> extends true ? false : true`  | `BoolNot<IsUnknown<T>>`         |
| `IsNotFixedLengthList<T>` | `number extends T['length'] ? true : false` | `BoolNot<IsFixedLengthList<T>>` |
| `IsNever<T>`              | `[T] extends [never] ? true : false`        | `TypeExtends<T, never>`         |

Each `IsNot*` previously duplicated the detection logic of its positive
counterpart, so the two could drift; they are now derived from it, which is
also what their documentation already claimed. `IsNever` was character-for-
character the definition of `TypeExtends<T, never>`.

Behavior is unchanged — the existing type tests for all four cover `any`,
`never`, `unknown`, unions, tuples and arrays.
