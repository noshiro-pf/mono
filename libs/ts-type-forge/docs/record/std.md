[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / record/std

# record/std

## Type Aliases

### StrictExtract

> **StrictExtract**\<`T`, `U`\> = `T` _extends_ `U` ? `T` : `never`

Defined in: [src/record/std.d.mts:16](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L16)

Extracts from union type `T` those types that are assignable to `U`.
This is a stricter version of the built-in `Extract` that requires `U` to extend `T`.

#### Type Parameters

##### T

`T`

The union type to extract from.

##### U

`U` _extends_ `T`

The type to extract, must extend `T`.

#### Returns

The intersection of `T` and `U`.

#### Example

```ts
type Union = 'a' | 'b' | 'c';
type Extracted = StrictExtract<Union, 'a' | 'b'>; // 'a' | 'b'
// type Invalid = StrictExtract<Union, 'a' | 'd'>; // Error: 'd' is not assignable to Union
```

---

### RelaxedExtract

> **RelaxedExtract**\<`T`, `U`\> = `T` _extends_ `U` ? `T` : `never`

Defined in: [src/record/std.d.mts:33](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L33)

Extracts from union type `T` those types that are assignable to `U`.
This is a relaxed version that doesn't require `U` to extend `T`.

#### Type Parameters

##### T

`T`

The union type to extract from.

##### U

`U`

The type to extract.

#### Returns

The intersection of `T` and `U`.

#### Example

```ts
type Union = 'a' | 'b' | 'c';
type Extracted = RelaxedExtract<Union, 'a' | 'd'>; // 'a'
type Numbers = RelaxedExtract<string | number | boolean, number>; // number
```

---

### StrictPick

> **StrictPick**\<`T`, `K`\> = `{ [P in K]: T[P] }`

Defined in: [src/record/std.d.mts:50](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L50)

Creates a type by picking a set of properties from `T` whose keys are in union `K`.
This is a stricter version that requires `K` to extend `keyof T`.

#### Type Parameters

##### T

`T`

The object type to pick from.

##### K

`K` _extends_ keyof `T`

The union of keys to pick, must extend `keyof T`.

#### Returns

An object type with only the specified properties.

#### Example

```ts
type Person = { name: string; age: number; email: string };
type BasicInfo = StrictPick<Person, 'name' | 'age'>; // { name: string; age: number }
// type Invalid = StrictPick<Person, 'name' | 'invalid'>; // Error: 'invalid' is not a key of Person
```

---

### RelaxedPick

> **RelaxedPick**\<`T`, `K`\> = `Pick`\<`T`, [`RelaxedExtract`](#relaxedextract)\<keyof `T`, `K`\>\>

Defined in: [src/record/std.d.mts:69](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L69)

Creates a type by picking a set of properties from `T` whose keys are in union `K`.
This is a relaxed version that filters out invalid keys automatically.

#### Type Parameters

##### T

`T`

The object type to pick from.

##### K

`K`

The union of keys to pick.

#### Returns

An object type with only the valid specified properties.

#### Example

```ts
type Person = { name: string; age: number; email: string };
type BasicInfo = RelaxedPick<Person, 'name' | 'age' | 'invalid'>; // { name: string; age: number }
type Empty = RelaxedPick<Person, 'nonexistent'>; // {}
```

---

### StrictExclude

> **StrictExclude**\<`T`, `U`\> = `T` _extends_ `U` ? `never` : `T`

Defined in: [src/record/std.d.mts:86](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L86)

Excludes from union type `T` those types that are assignable to `U`.
This is a stricter version that requires `U` to extend `T`.

#### Type Parameters

##### T

`T`

The union type to exclude from.

##### U

`U` _extends_ `T`

The type to exclude, must extend `T`.

#### Returns

The union `T` minus `U`.

#### Example

```ts
type Union = 'a' | 'b' | 'c';
type Remaining = StrictExclude<Union, 'a' | 'b'>; // 'c'
// type Invalid = StrictExclude<Union, 'a' | 'd'>; // Error: 'd' is not assignable to Union
```

---

### RelaxedExclude

> **RelaxedExclude**\<`T`, `U`\> = `T` _extends_ `U` ? `never` : `T`

Defined in: [src/record/std.d.mts:103](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L103)

Excludes from union type `T` those types that are assignable to `U`.
This is a relaxed version that doesn't require `U` to extend `T`.

#### Type Parameters

##### T

`T`

The union type to exclude from.

##### U

`U`

The type to exclude.

#### Returns

The union `T` minus any types assignable to `U`.

#### Example

```ts
type Union = 'a' | 'b' | 'c';
type Remaining = RelaxedExclude<Union, 'a' | 'd'>; // 'b' | 'c'
type NonStrings = RelaxedExclude<string | number | boolean, string>; // number | boolean
```

---

### StrictOmit

> **StrictOmit**\<`T`, `K`\> = `Pick`\<`T`, `Exclude`\<keyof `T`, `K`\>\>

Defined in: [src/record/std.d.mts:120](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L120)

Creates a type with all properties of `T` except for those in union `K`.
This is a stricter version that requires `K` to extend `keyof T`.

#### Type Parameters

##### T

`T`

The object type to omit from.

##### K

`K` _extends_ keyof `T`

The union of keys to omit, must extend `keyof T`.

#### Returns

An object type without the specified properties.

#### Example

```ts
type Person = { name: string; age: number; email: string };
type PublicInfo = StrictOmit<Person, 'email'>; // { name: string; age: number }
// type Invalid = StrictOmit<Person, 'email' | 'invalid'>; // Error: 'invalid' is not a key of Person
```

---

### RelaxedOmit

> **RelaxedOmit**\<`T`, `K`\> = `Pick`\<`T`, [`RelaxedExclude`](#relaxedexclude)\<keyof `T`, `K`\>\>

Defined in: [src/record/std.d.mts:137](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L137)

Creates a type with all properties of `T` except for those in union `K`.
This is a relaxed version that ignores invalid keys automatically.

#### Type Parameters

##### T

`T`

The object type to omit from.

##### K

`K`

The union of keys to omit.

#### Returns

An object type without the valid specified properties.

#### Example

```ts
type Person = { name: string; age: number; email: string };
type PublicInfo = RelaxedOmit<Person, 'email' | 'invalid'>; // { name: string; age: number }
type Same = RelaxedOmit<Person, 'nonexistent'>; // { name: string; age: number; email: string }
```

---

### ReadonlyRecord

> **ReadonlyRecord**\<`K`, `T`\> = `{ readonly [P in K]: T }`

Defined in: [src/record/std.d.mts:155](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L155)

Creates a readonly record type with keys of type `K` and values of type `T`.
All properties are readonly and cannot be modified after creation.

#### Type Parameters

##### K

`K` _extends_ `PropertyKey`

The type of keys, must extend `PropertyKey` (string | number | symbol).

##### T

`T`

The type of values.

#### Returns

A readonly record type.

#### Example

```ts
type Config = ReadonlyRecord<string, string | number>;
const settings: Config = { host: 'localhost', port: 3000 };
// settings.host = 'new-host'; // Error: Cannot assign to 'host' because it is a read-only property
```

---

### MutableRecord

> **MutableRecord**\<`K`, `T`\> = `{ [P in K]: T }`

Defined in: [src/record/std.d.mts:176](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L176)

Creates a mutable record type with keys of type `K` and values of type `T`.
All properties are mutable and can be modified after creation.

#### Type Parameters

##### K

`K` _extends_ `PropertyKey`

The type of keys, must extend `PropertyKey` (string | number | symbol).

##### T

`T`

The type of values.

#### Returns

A mutable record type.

#### Example

```ts
type Config = MutableRecord<string, string | number>;
const settings: Config = { host: 'localhost', port: 3000 };
settings.host = 'new-host'; // OK
settings.timeout = 5000; // OK
```
