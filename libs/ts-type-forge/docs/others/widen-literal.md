[**ts-type-forge**](../README.md)

***

[ts-type-forge](../README.md) / others/widen-literal

# others/widen-literal

## Type Aliases

### WidenLiteral

> **WidenLiteral**\<`T`\> = `T` *extends* `string` ? `string` : `T` *extends* `number` ? `number` : `T` *extends* `boolean` ? `boolean` : `T` *extends* `bigint` ? `bigint` : `T` *extends* `symbol` ? `symbol` : `T`

Defined in: [src/others/widen-literal.d.mts:47](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/widen-literal.d.mts#L47)

Widens a literal type `T` to its corresponding primitive type.

This utility converts specific literal types (like `"hello"` or `42`) to their
broader primitive types (like `string` or `number`). If `T` is not a literal type
of a primitive, it returns `T` unchanged.

This is useful when you need to convert from specific literal types to more
general types, often for compatibility with APIs that expect primitive types
rather than specific literals.

#### Type Parameters

##### T

`T`

The type to potentially widen.

#### Returns

The widened primitive type if `T` is a literal of a primitive, otherwise `T`.

#### Example

```ts
// Basic literal widening
type Str = WidenLiteral<"hello">;   // string
type Num = WidenLiteral<123>;       // number
type Bool = WidenLiteral<true>;     // boolean
type Big = WidenLiteral<100n>;      // bigint
type Sym = WidenLiteral<typeof Symbol.iterator>; // symbol

// Non-primitives remain unchanged
type Obj = WidenLiteral<{ a: number }>; // { a: number } (unchanged)
type Arr = WidenLiteral<[1, 2, 3]>;     // [1, 2, 3] (unchanged)

// Union types are widened distributively
type Union = WidenLiteral<"a" | 1 | true>; // string | number | boolean

// Practical use case: API compatibility
interface ApiConfig {
  method: string;  // API expects string, not literal
  timeout: number; // API expects number, not literal
}

type LiteralConfig = {
  method: "GET" | "POST";
  timeout: 5000;
};

type CompatibleConfig = {
  [K in keyof LiteralConfig]: WidenLiteral<LiteralConfig[K]>;
}; // { method: string; timeout: number }
```
