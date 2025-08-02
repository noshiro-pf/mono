[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / others/mutable

# others/mutable

## Type Aliases

### Mutable\<T\>

> **Mutable**\<`T`\> = `{ -readonly [P in keyof T]: T[P] }`

Defined in: [others/mutable.d.mts:30](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L30)

Makes all properties of an object type `T` mutable by removing the `readonly` modifier.
This utility is the opposite of TypeScript's built-in `Readonly<T>` utility type.

Uses the `-readonly` modifier syntax to explicitly remove readonly modifiers
from all properties at the top level of the object type.

#### Type Parameters

##### T

`T`

The object type to make mutable.

#### Returns

An object type with all readonly modifiers removed.

#### Example

```ts
type ReadonlyUser = {
    readonly id: number;
    readonly name: string;
    readonly email: string;
};

type MutableUser = Mutable<ReadonlyUser>;
// Result: { id: number; name: string; email: string }

const user: MutableUser = { id: 1, name: 'Alice', email: 'alice@example.com' };
user.name = 'Alice Smith'; // ✓ allowed - property is mutable

// Useful for creating editable versions of readonly data
type Config = Readonly<{ host: string; port: number; ssl: boolean }>;
type EditableConfig = Mutable<Config>; // { host: string; port: number; ssl: boolean }
```

---

### ToMutableMap\<T\>

> **ToMutableMap**\<`T`\> = `T` _extends_ `ReadonlyMap`\<infer K, infer V\> ? `Map`\<`K`, `V`\> : `never`

Defined in: [others/mutable.d.mts:51](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L51)

Converts a `ReadonlyMap<K, V>` type to its mutable counterpart `Map<K, V>`.
Extracts the key and value types from the readonly map and creates a standard mutable Map.

#### Type Parameters

##### T

`T` _extends_ `ReadonlyMap`\<`any`, `any`\>

A type that extends `ReadonlyMap<any, any>`.

#### Returns

The corresponding mutable `Map<K, V>` type.

#### Example

```ts
type ReadOnlyUserMap = ReadonlyMap<string, User>;
type MutableUserMap = ToMutableMap<ReadOnlyUserMap>; // Map<string, User>

// Useful when you need to convert readonly collections to mutable ones
const convertToMutable = (
    readonlyMap: ReadonlyMap<string, number>,
): Map<string, number> => {
    return new Map(readonlyMap);
};
```

---

### ToMutableSet\<T\>

> **ToMutableSet**\<`T`\> = `T` _extends_ `ReadonlySet`\<infer V\> ? `Set`\<`V`\> : `never`

Defined in: [others/mutable.d.mts:73](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L73)

Converts a `ReadonlySet<V>` type to its mutable counterpart `Set<V>`.
Extracts the value type from the readonly set and creates a standard mutable Set.

#### Type Parameters

##### T

`T` _extends_ `ReadonlySet`\<`any`\>

A type that extends `ReadonlySet<any>`.

#### Returns

The corresponding mutable `Set<V>` type.

#### Example

```ts
type ReadOnlyStringSet = ReadonlySet<string>;
type MutableStringSet = ToMutableSet<ReadOnlyStringSet>; // Set<string>

// Converting readonly collections to mutable ones
const convertToMutable = (readonlySet: ReadonlySet<string>): Set<string> => {
    return new Set(readonlySet);
};
```

---

### MutableSet\<K\>

> **MutableSet**\<`K`\> = `Set`\<`K`\>

Defined in: [others/mutable.d.mts:90](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L90)

Alias for the standard `Set<K>` type. Represents a mutable set collection.
Provided for consistency with naming conventions and to make intent explicit.

#### Type Parameters

##### K

`K`

The type of elements stored in the set.

#### Example

```ts
type TagSet = MutableSet<string>;
const tags: TagSet = new Set(['typescript', 'javascript', 'react']);
tags.add('vue'); // ✓ allowed - set is mutable
tags.delete('react'); // ✓ allowed
```

---

### MutableMap\<K, V\>

> **MutableMap**\<`K`, `V`\> = `Map`\<`K`, `V`\>

Defined in: [others/mutable.d.mts:107](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/mutable.d.mts#L107)

Alias for the standard `Map<K, V>` type. Represents a mutable map collection.
Provided for consistency with naming conventions and to make intent explicit.

#### Type Parameters

##### K

`K`

The type of keys in the map.

##### V

`V`

The type of values in the map.

#### Example

```ts
type UserCache = MutableMap<string, User>;
const cache: UserCache = new Map();
cache.set('user1', { id: 1, name: 'Alice' }); // ✓ allowed - map is mutable
cache.delete('user1'); // ✓ allowed
```
