[**Documentation**](../README.md)

---

[Documentation](../README.md) / tuple-and-list/make-tuple

# tuple-and-list/make-tuple

## Type Aliases

### MakeTuple\<Elm, N\>

> **MakeTuple**\<`Elm`, `N`\> = `TSTypeForgeInternals.MakeTupleInternals.MakeTupleImpl`\<`Elm`, `` `${N}` ``, \[\]\>

Defined in: [tuple-and-list/make-tuple.d.mts:13](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/make-tuple.d.mts#L13)

Creates a readonly tuple type of a specific length `N` with elements of type `Elm`.

#### Type Parameters

##### Elm

`Elm`

The type of elements in the tuple.

##### N

`N` _extends_ `number`

The desired length of the tuple (must be a non-negative integer literal).

#### Returns

A readonly tuple type `readonly [Elm, Elm, ..., Elm]` of length `N`.

#### Example

```ts
type TupleOf3Strings = MakeTuple<string, 3>; // readonly [string, string, string]
type TupleOf0Numbers = MakeTuple<number, 0>; // readonly []
// type InvalidLength = MakeTuple<boolean, -1>; // Error or unexpected result
// type InvalidLength2 = MakeTuple<boolean, 1.5>; // Error or unexpected result
```
