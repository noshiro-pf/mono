[**Documentation**](../README.md)

---

[Documentation](../README.md) / others/mutable

# others/mutable

## Type Aliases

### Mutable\<T\>

> **Mutable**\<`T`\> = `{ -readonly [P in keyof T]: T[P] }`

Defined in: [others/mutable.d.mts:8](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L8)

Makes all properties of an object type `T` mutable (removes the `readonly` modifier).

#### Type Parameters

##### T

`T`

The object type to make mutable.

#### Example

```ts
type ReadonlyObj = { readonly a: string; readonly b: number };
type MutableObj = Mutable<ReadonlyObj>; // { a: string; b: number }
```

---

### MutableMap\<K, V\>

> **MutableMap**\<`K`, `V`\> = `Map`\<`K`, `V`\>

Defined in: [others/mutable.d.mts:41](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L41)

Alias for the standard `Map<K, V>` type. Represents a mutable map.

#### Type Parameters

##### K

`K`

The type of keys in the map.

##### V

`V`

The type of values in the map.

---

### MutableSet\<K\>

> **MutableSet**\<`K`\> = `Set`\<`K`\>

Defined in: [others/mutable.d.mts:34](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L34)

Alias for the standard `Set<K>` type. Represents a mutable set.

#### Type Parameters

##### K

`K`

The type of elements in the set.

---

### ToMutableMap\<T\>

> **ToMutableMap**\<`T`\> = `T` _extends_ `ReadonlyMap`\<infer K, infer V\> ? `Map`\<`K`, `V`\> : `never`

Defined in: [others/mutable.d.mts:17](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L17)

Converts a `ReadonlyMap<K, V>` type to its mutable counterpart `Map<K, V>`.

#### Type Parameters

##### T

`T` _extends_ `ReadonlyMap`\<`any`, `any`\>

A type extending `ReadonlyMap<any, any>`.

#### Example

```ts
type RMap = ReadonlyMap<string, number>;
type MMap = ToMutableMap<RMap>; // Map<string, number>
```

---

### ToMutableSet\<T\>

> **ToMutableSet**\<`T`\> = `T` _extends_ `ReadonlySet`\<infer V\> ? `Set`\<`V`\> : `never`

Defined in: [others/mutable.d.mts:27](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L27)

Converts a `ReadonlySet<V>` type to its mutable counterpart `Set<V>`.

#### Type Parameters

##### T

`T` _extends_ `ReadonlySet`\<`any`\>

A type extending `ReadonlySet<any>`.

#### Example

```ts
type RSet = ReadonlySet<string>;
type MSet = ToMutableSet<RSet>; // Set<string>
```
