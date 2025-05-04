[**Documentation**](../README.md)

---

[Documentation](../README.md) / others/widen-literal

# others/widen-literal

## Type Aliases

### WidenLiteral\<T\>

> **WidenLiteral**\<`T`\> = `T` _extends_ `string` ? `string` : `T` _extends_ `number` ? `number` : `T` _extends_ `boolean` ? `boolean` : `T` _extends_ `bigint` ? `bigint` : `T` _extends_ `symbol` ? `symbol` : `T`

Defined in: [others/widen-literal.d.mts:17](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/widen-literal.d.mts#L17)

Widens a literal type `T` to its corresponding primitive type.
If `T` is not a literal type, it returns `T` unchanged.

#### Type Parameters

##### T

`T`

The type to potentially widen.

#### Returns

The widened primitive type if `T` is a literal, otherwise `T`.

#### Example

```ts
type Str = WidenLiteral<'hello'>; // string
type Num = WidenLiteral<123>; // number
type Bool = WidenLiteral<true>; // boolean
type Big = WidenLiteral<100n>; // bigint
type Sym = WidenLiteral<typeof Symbol.iterator>; // symbol
type Obj = WidenLiteral<{ a: number }>; // { a: number } (unchanged)
type Union = WidenLiteral<'a' | 1>; // string | number
```
