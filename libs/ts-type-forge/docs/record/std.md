[**Documentation**](../README.md)

---

[Documentation](../README.md) / record/std

# record/std

## Type Aliases

### MutableRecord\<K, T\>

> **MutableRecord**\<`K`, `T`\> = `{ [P in K]: T }`

Defined in: [record/std.d.mts:35](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L35)

Construct a type with a set of properties K of type T

#### Type Parameters

##### K

`K` _extends_ `PropertyKey`

##### T

`T`

---

### ReadonlyRecord\<K, T\>

> **ReadonlyRecord**\<`K`, `T`\> = `{ readonly [P in K]: T }`

Defined in: [record/std.d.mts:29](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L29)

Construct a type with a set of properties K of type T

#### Type Parameters

##### K

`K` _extends_ `PropertyKey`

##### T

`T`

---

### RelaxedExclude\<T, U\>

> **RelaxedExclude**\<`T`, `U`\> = `T` _extends_ `U` ? `never` : `T`

Defined in: [record/std.d.mts:19](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L19)

Exclude from T those types that are assignable to U

#### Type Parameters

##### T

`T`

##### U

`U`

---

### RelaxedExtract\<T, U\>

> **RelaxedExtract**\<`T`, `U`\> = `T` _extends_ `U` ? `T` : `never`

Defined in: [record/std.d.mts:5](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L5)

Extract from T those types that are assignable to U

#### Type Parameters

##### T

`T`

##### U

`U`

---

### RelaxedOmit\<T, K\>

> **RelaxedOmit**\<`T`, `K`\> = `Pick`\<`T`, [`RelaxedExclude`](#relaxedexclude)\<keyof `T`, `K`\>\>

Defined in: [record/std.d.mts:25](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L25)

Construct a type with the properties of T except for those in type K.

#### Type Parameters

##### T

`T`

##### K

`K`

---

### RelaxedPick\<T, K\>

> **RelaxedPick**\<`T`, `K`\> = `Pick`\<`T`, [`RelaxedExtract`](#relaxedextract)\<keyof `T`, `K`\>\>

Defined in: [record/std.d.mts:13](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L13)

From T, pick a set of properties whose keys are in the union K

#### Type Parameters

##### T

`T`

##### K

`K`

---

### StrictExclude\<T, U\>

> **StrictExclude**\<`T`, `U`\> = `T` _extends_ `U` ? `never` : `T`

Defined in: [record/std.d.mts:16](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L16)

Exclude from T those types that are assignable to U

#### Type Parameters

##### T

`T`

##### U

`U` _extends_ `T`

---

### StrictExtract\<T, U\>

> **StrictExtract**\<`T`, `U`\> = `T` _extends_ `U` ? `T` : `never`

Defined in: [record/std.d.mts:2](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L2)

Extract from T those types that are assignable to U

#### Type Parameters

##### T

`T`

##### U

`U` _extends_ `T`

---

### StrictOmit\<T, K\>

> **StrictOmit**\<`T`, `K`\> = `Pick`\<`T`, `Exclude`\<keyof `T`, `K`\>\>

Defined in: [record/std.d.mts:22](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L22)

Construct a type with the properties of T except for those in type K.

#### Type Parameters

##### T

`T`

##### K

`K` _extends_ keyof `T`

---

### StrictPick\<T, K\>

> **StrictPick**\<`T`, `K`\> = `{ [P in K]: T[P] }`

Defined in: [record/std.d.mts:8](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/std.d.mts#L8)

From T, pick a set of properties whose keys are in the union K

#### Type Parameters

##### T

`T`

##### K

`K` _extends_ keyof `T`
