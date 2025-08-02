[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / condition/eq

# condition/eq

## Type Aliases

### TypeEq\<A, B\>

> **TypeEq**\<`A`, `B`\> = \<`T`\>() => `T` _extends_ `A` ? `1` : `2` _extends_ \<`T`\>() => `T` _extends_ `B` ? `1` : `2` ? `true` : `false`

Defined in: [condition/eq.d.mts:23](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/condition/eq.d.mts#L23)

Checks if two types `A` and `B` are exactly the same.

This utility uses a technique involving conditional types within function types
to determine type equality. It returns the boolean literal `true` if `A` and `B`
are identical types, and `false` otherwise.

#### Type Parameters

##### A

`A`

The first type to compare.

##### B

`B`

The second type to compare.

#### Returns

`true` if `A` and `B` are the same type, `false` otherwise.

#### Example

```ts
type T1 = TypeEq<string, string>; // true
type T2 = TypeEq<string, number>; // false
type T3 = TypeEq<{ a: number }, { a: number }>; // true
type T4 = TypeEq<{ a: number }, { b: number }>; // false
type T5 = TypeEq<any, string>; // false (usually, depends on TS version specifics)
type T6 = TypeEq<never, never>; // true
type T7 = TypeEq<string | number, number | string>; // true
```
