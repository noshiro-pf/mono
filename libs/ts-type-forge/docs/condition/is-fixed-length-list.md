[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / condition/is-fixed-length-list

# condition/is-fixed-length-list

## Type Aliases

### IsFixedLengthList\<T\>

> **IsFixedLengthList**\<`T`\> = `number` _extends_ `T`\[`"length"`\] ? `false` : `true`

Defined in: [src/condition/is-fixed-length-list.d.mts:19](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/condition/is-fixed-length-list.d.mts#L19)

Checks if a given readonly array type `T` has a fixed length (i.e., is a tuple).
Returns `true` if `T` is a tuple, `false` if it's a regular array (`Type[]`).

It works by checking if the general `number` type is assignable to the specific `length` property of `T`.
For tuples, `T['length']` is a specific number literal (e.g., `3`), and `number` is not assignable to `3`.
For regular arrays, `T['length']` is `number`, and `number` is assignable to `number`.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The readonly array or tuple type to check.

#### Returns

`true` if `T` is a tuple (fixed length), `false` otherwise.

#### Example

```ts
type IsTuple = IsFixedLengthList<[1, 2, 3]>; // true
type IsArray = IsFixedLengthList<number[]>; // false
type IsReadonlyArray = IsFixedLengthList<readonly string[]>; // false
type IsEmptyTuple = IsFixedLengthList<[]>; // true
type IsTupleWithRest = IsFixedLengthList<[number, ...string[]]>; // false
```

---

### IsNotFixedLengthList\<T\>

> **IsNotFixedLengthList**\<`T`\> = `number` _extends_ `T`\[`"length"`\] ? `true` : `false`

Defined in: [src/condition/is-fixed-length-list.d.mts:37](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/condition/is-fixed-length-list.d.mts#L37)

Checks if a given readonly array type `T` does _not_ have a fixed length (i.e., is a regular array).
Returns `true` if `T` is a regular array (`Type[]`), `false` if it's a tuple.
This is the logical negation of `IsFixedLengthList`.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The readonly array or tuple type to check.

#### Returns

`true` if `T` is a regular array (not fixed length), `false` otherwise.

#### Example

```ts
type IsNotTuple = IsNotFixedLengthList<[1, 2, 3]>; // false
type IsNotArray = IsNotFixedLengthList<number[]>; // true
type IsNotReadonlyArray = IsNotFixedLengthList<readonly string[]>; // true
type IsNotEmptyTuple = IsNotFixedLengthList<[]>; // false
type IsNotTupleWithRest = IsNotFixedLengthList<[number, ...string[]]>; // true
```
