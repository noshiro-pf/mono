[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / record/deep

# record/deep

## Type Aliases

### DeepReadonly

> **DeepReadonly**\<`T`\> = `T` _extends_ [`Primitive`](../constants/primitive.md#primitive) ? `T` : `T` _extends_ (...`args`) => `any` ? `T` : `T` _extends_ [`MutableMap`](../others/mutable.md#mutablemap)\<infer K, infer V\> ? `ReadonlyMap`\<[`DeepReadonly`](#deepreadonly)\<`K`\>, [`DeepReadonly`](#deepreadonly)\<`V`\>\> : `T` _extends_ `ReadonlyMap`\<infer K, infer V\> ? `ReadonlyMap`\<[`DeepReadonly`](#deepreadonly)\<`K`\>, [`DeepReadonly`](#deepreadonly)\<`V`\>\> : `T` _extends_ [`MutableSet`](../others/mutable.md#mutableset)\<infer V\> ? `ReadonlySet`\<[`DeepReadonly`](#deepreadonly)\<`V`\>\> : `T` _extends_ `ReadonlySet`\<infer V\> ? `ReadonlySet`\<[`DeepReadonly`](#deepreadonly)\<`V`\>\> : `T` _extends_ `Record`\<`string`, `any`\> \| readonly `unknown`[] ? `{ readonly [K in keyof T]: DeepReadonly<T[K]> }` : `T`

Defined in: [src/record/deep.d.mts:17](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/deep.d.mts#L17)

Recursively applies the `readonly` modifier to all properties of an object, array, Map, or Set.
Primitives and functions are returned as is.

#### Type Parameters

##### T

`T`

The type to make deeply readonly.

#### Returns

A new type with all nested properties marked as readonly.

#### Example

```ts
type Data = { a: number; b: { c: string[]; d: Map<number, boolean> } };
type ReadonlyData = DeepReadonly<Data>;
// Result: {
//   readonly a: number;
//   readonly b: {
//     readonly c: readonly string[];
//     readonly d: ReadonlyMap<number, boolean>;
//   };
// }
```

---

### DeepMutable

> **DeepMutable**\<`T`\> = `T` _extends_ [`Primitive`](../constants/primitive.md#primitive) ? `T` : `T` _extends_ (...`args`) => `any` ? `T` : `T` _extends_ [`MutableMap`](../others/mutable.md#mutablemap)\<infer K, infer V\> ? [`MutableMap`](../others/mutable.md#mutablemap)\<[`DeepMutable`](#deepmutable)\<`K`\>, [`DeepMutable`](#deepmutable)\<`V`\>\> : `T` _extends_ `ReadonlyMap`\<infer K, infer V\> ? [`MutableMap`](../others/mutable.md#mutablemap)\<[`DeepMutable`](#deepmutable)\<`K`\>, [`DeepMutable`](#deepmutable)\<`V`\>\> : `T` _extends_ [`MutableSet`](../others/mutable.md#mutableset)\<infer V\> ? [`MutableSet`](../others/mutable.md#mutableset)\<[`DeepMutable`](#deepmutable)\<`V`\>\> : `T` _extends_ `ReadonlySet`\<infer V\> ? [`MutableSet`](../others/mutable.md#mutableset)\<[`DeepMutable`](#deepmutable)\<`V`\>\> : `T` _extends_ `Record`\<`string`, `any`\> \| readonly `unknown`[] ? `{ -readonly [K in keyof T]: DeepMutable<T[K]> }` : `T`

Defined in: [src/record/deep.d.mts:47](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/deep.d.mts#L47)

Recursively removes the `readonly` modifier from all properties of an object, array, Map, or Set.
Primitives and functions are returned as is.

#### Type Parameters

##### T

`T`

The type to make deeply mutable.

#### Returns

A new type with all nested `readonly` modifiers removed.

#### Example

```ts
type ReadonlyData = {
    readonly a: number;
    readonly b: { readonly c: readonly string[] };
};
type MutableData = DeepMutable<ReadonlyData>;
// Result: { a: number; b: { c: string[] } }
```

---

### DeepPartial

> **DeepPartial**\<`T`\> = `T` _extends_ [`Primitive`](../constants/primitive.md#primitive) ? `T` : `T` _extends_ (...`args`) => `any` ? `T` : `T` _extends_ [`MutableMap`](../others/mutable.md#mutablemap)\<infer K, infer V\> ? [`MutableMap`](../others/mutable.md#mutablemap)\<[`DeepPartial`](#deeppartial)\<`K`\>, [`DeepPartial`](#deeppartial)\<`V`\>\> : `T` _extends_ `ReadonlyMap`\<infer K, infer V\> ? `ReadonlyMap`\<[`DeepPartial`](#deeppartial)\<`K`\>, [`DeepPartial`](#deeppartial)\<`V`\>\> : `T` _extends_ [`MutableSet`](../others/mutable.md#mutableset)\<infer V\> ? [`MutableSet`](../others/mutable.md#mutableset)\<[`DeepPartial`](#deeppartial)\<`V`\>\> : `T` _extends_ `ReadonlySet`\<infer V\> ? `ReadonlySet`\<[`DeepPartial`](#deeppartial)\<`V`\>\> : `T` _extends_ `Record`\<`string`, `any`\> \| readonly `unknown`[] ? `{ [K in keyof T]?: DeepPartial<T[K]> }` : `T`

Defined in: [src/record/deep.d.mts:84](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/deep.d.mts#L84)

Recursively applies the `?` optional modifier to all properties of an UnknownRecord or array.
Handles Map and Set types by applying `DeepPartial` to their keys/values.
Primitives and functions are returned as is.

#### Type Parameters

##### T

`T`

The type to make deeply partial.

#### Returns

A new type with all nested properties marked as optional.

#### Example

```ts
type Data = { a: number; b: { c: string[]; d: Map<number, boolean> } };
type PartialData = DeepPartial<Data>;
// Result: {
//   a?: number | undefined;
//   b?: {
//     c?: (string | undefined)[] | undefined;
//     d?: ReadonlyMap<number | undefined, boolean | undefined> | undefined;
//   } | undefined;
// }
```

---

### DeepRequired

> **DeepRequired**\<`T`\> = `T` _extends_ [`Primitive`](../constants/primitive.md#primitive) ? `T` : `T` _extends_ (...`args`) => `any` ? `T` : `T` _extends_ [`MutableMap`](../others/mutable.md#mutablemap)\<infer K, infer V\> ? [`MutableMap`](../others/mutable.md#mutablemap)\<[`DeepRequired`](#deeprequired)\<`K`\>, [`DeepRequired`](#deeprequired)\<`V`\>\> : `T` _extends_ `ReadonlyMap`\<infer K, infer V\> ? `ReadonlyMap`\<[`DeepRequired`](#deeprequired)\<`K`\>, [`DeepRequired`](#deeprequired)\<`V`\>\> : `T` _extends_ [`MutableSet`](../others/mutable.md#mutableset)\<infer V\> ? [`MutableSet`](../others/mutable.md#mutableset)\<[`DeepRequired`](#deeprequired)\<`V`\>\> : `T` _extends_ `ReadonlySet`\<infer V\> ? `ReadonlySet`\<[`DeepRequired`](#deeprequired)\<`V`\>\> : `T` _extends_ `Record`\<`string`, `any`\> \| readonly `unknown`[] ? `{ [K in keyof T]-?: DeepRequired<T[K]> }` : `T`

Defined in: [src/record/deep.d.mts:115](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/deep.d.mts#L115)

Recursively removes the `?` optional modifier from all properties of an object or array.
Handles Map and Set types by applying `DeepRequired` to their keys/values.
Primitives and functions are returned as is.

#### Type Parameters

##### T

`T`

The type to make deeply required.

#### Returns

A new type with all nested properties marked as required.

#### Example

```ts
type PartialData = { a?: number; b?: { c?: string[] } };
type RequiredData = DeepRequired<PartialData>;
// Result: { a: number; b: { c: string[] } }
```
