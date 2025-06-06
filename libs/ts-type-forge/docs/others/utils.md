[**Documentation**](../README.md)

---

[Documentation](../README.md) / others/utils

# others/utils

## Type Aliases

### ToString\<A\>

> **ToString**\<`A`\> = `A` _extends_ `number` ? `` `${A}` `` : `A`

Defined in: [others/utils.d.mts:10](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L10)

Converts a type `A` to its string representation if it's a number, otherwise returns `A`.

#### Type Parameters

##### A

`A`

The type to convert.

#### Example

```ts
type Str = ToString<123>; // "123"
type Bool = ToString<boolean>; // boolean
```

---

### ToNumber\<S\>

> **ToNumber**\<`S`\> = `S` _extends_ `` `${infer N extends number}` `` ? `N` : `never`

Defined in: [others/utils.d.mts:21](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L21)

Converts a string literal type representing a number back to a number type.
Requires TypeScript 4.8+.

#### Type Parameters

##### S

`S` _extends_ `` `${number}` ``

A string literal type that extends `${number}`.

#### Example

```ts
type Num = ToNumber<'456'>; // 456
```

---

### ValueOf\<T\>

> **ValueOf**\<`T`\> = `T`\[keyof `T`\]

Defined in: [others/utils.d.mts:31](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L31)

Extracts the union of all value types from an object type `T`.

#### Type Parameters

##### T

`T`

The object type.

#### Example

```ts
type Values = ValueOf<{ a: string; b: number }>; // string | number
```

---

### Length\<T\>

> **Length**\<`T`\> = `T`\[`"length"`\]

Defined in: [others/utils.d.mts:43](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L43)

Extracts the `length` property type from a type `T` that has a numeric `length` property.
Typically used for arrays and tuples.

#### Type Parameters

##### T

`T` _extends_ `Readonly`\<\{ `length`: `number`; \}\>

A type with a `length: number` property (e.g., `readonly unknown[]`).

#### Returns

The type of the `length` property (e.g., `number` for arrays, a number literal for tuples).

#### Example

```ts
type TupleLen = Length<[1, 2, 3]>; // 3
type ArrayLen = Length<string[]>; // number
type StringLen = Length<'abc'>; // 3
```

---

### FunctionType()\<A, B\>

> **FunctionType**\<`A`, `B`\> = (`arg`) => `B`

Defined in: [others/utils.d.mts:51](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L51)

Represents a function type that takes an argument of type `A` and returns a value of type `B`.
Alias for `(arg: A) => B`.

#### Type Parameters

##### A

`A`

The argument type.

##### B

`B`

The return type.

#### Parameters

##### arg

`A`

#### Returns

`B`

---

### Fn()\<A, B\>

> **Fn**\<`A`, `B`\> = (`arg`) => `B`

Defined in: [others/utils.d.mts:59](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L59)

Represents a function type that takes an argument of type `A` and returns a value of type `B`.
Shorter alias for `(arg: A) => B`.

#### Type Parameters

##### A

`A`

The argument type.

##### B

`B`

The return type.

#### Parameters

##### arg

`A`

#### Returns

`B`

---

### MonoTypeFunction\<X\>

> **MonoTypeFunction**\<`X`\> = [`Fn`](#fn)\<`X`, `X`\>

Defined in: [others/utils.d.mts:65](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L65)

Represents a function type where the argument and return types are the same (`X`).

#### Type Parameters

##### X

`X`

The argument and return type.

---

### Reducer()\<S, A\>

> **Reducer**\<`S`, `A`\> = (`state`, `action`) => `S`

Defined in: [others/utils.d.mts:73](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L73)

Represents a reducer function type used typically in state management.
Takes the current state `S` and an action `A`, and returns the new state `S`.

#### Type Parameters

##### S

`S`

The state type.

##### A

`A`

The action type.

#### Parameters

##### state

`S`

##### action

`A`

#### Returns

`S`

---

### UnionToIntersection\<T\>

> **UnionToIntersection**\<`T`\> = `T` _extends_ `unknown` ? (`arg`) => `void` : `never` _extends_ (`arg`) => `void` ? `F` : `never`

Defined in: [others/utils.d.mts:81](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L81)

Converts a union type `T` into an intersection type.

#### Type Parameters

##### T

`T`

The union type.

#### Example

```ts
type Inter = UnionToIntersection<{ a: string } | { b: number }>; // { a: string } & { b: number }
```

---

### MergeIntersection\<R\>

> **MergeIntersection**\<`R`\> = `{ [K in keyof R]: R[K] }`

Defined in: [others/utils.d.mts:94](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L94)

Merges an intersection of object types `R` into a single object type with combined properties.
Useful for making intersected types more readable in tooltips.

#### Type Parameters

##### R

`R` _extends_ [`UnknownRecord`](../constants/record.md#unknownrecord)

An intersection of record types.

#### Example

```ts
type Merged = MergeIntersection<{ a: string } & { b: number }>; // { a: string; b: number }
```

---

### ExcludeFalsyValue\<A\>

> **ExcludeFalsyValue**\<`A`\> = [`RelaxedExclude`](../record/std.md#relaxedexclude)\<`A`, [`FalsyValue`](../constants/falsy-value.md#falsyvalue)\>

Defined in: [others/utils.d.mts:103](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L103)

Excludes falsy values (false, 0, '', null, undefined) from type `A`.
Note: Does not exclude `NaN` as it's not representable as a literal type.

#### Type Parameters

##### A

`A`

The type to filter.

---

### Intersection\<Types\>

> **Intersection**\<`Types`\> = `TSTypeForgeInternals.IntersectionImpl`\<`Types`\>

Defined in: [others/utils.d.mts:111](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L111)

Creates an intersection type from a tuple of types `Types`.

#### Type Parameters

##### Types

`Types` _extends_ readonly `unknown`[]

A readonly tuple of types.

#### Example

```ts
type Inter = Intersection<[string, number, { a: boolean }]>; // string & number & { a: boolean }
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md)
