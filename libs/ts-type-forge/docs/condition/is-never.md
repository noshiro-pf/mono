[**Documentation**](../README.md)

---

[Documentation](../README.md) / condition/is-never

# condition/is-never

## Type Aliases

### IsNever\<T\>

> **IsNever**\<`T`\> = \[`T`\] _extends_ \[`never`\] ? `true` : `false`

Defined in: [condition/is-never.d.mts:18](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/condition/is-never.d.mts#L18)

Checks if a given type `T` is exactly the `never` type.

It uses the `[T] extends [never]` pattern to correctly identify `never` even when `T`
is a generic type parameter, avoiding issues with conditional type distribution.

#### Type Parameters

##### T

`T`

The type to check.

#### Returns

`true` if `T` is `never`, `false` otherwise.

#### Example

```ts
type T1 = IsNever<never>; // true
type T2 = IsNever<string>; // false
type T3 = IsNever<any>; // false
type T4 = IsNever<unknown>; // false
type T5 = IsNever<string | never>; // false (evaluates to string)
type T6 = IsNever<string & never>; // true (evaluates to never)
```
