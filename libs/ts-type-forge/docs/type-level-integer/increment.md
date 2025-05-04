[**Documentation**](../README.md)

---

[Documentation](../README.md) / type-level-integer/increment

# type-level-integer/increment

## Type Aliases

### Decrement\<N\>

> **Decrement**\<`N`\> = [`Tail`](../tuple-and-list/list/namespaces/List.md#tail)\<[`MakeTuple`](../tuple-and-list/make-tuple.md#maketuple)\<`0`, `N`\>\>\[`"length"`\]

Defined in: [type-level-integer/increment.d.mts:24](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/increment.d.mts#L24)

Decrements a positive integer literal type `N` by 1.
It works by creating a tuple of length `N`, removing the first element (Tail), and taking the new length.

#### Type Parameters

##### N

`N` _extends_ `number`

A positive integer literal type (must be >= 1).

#### Returns

The number literal type `N - 1`.

#### Example

```ts
type Three = Decrement<4>; // 3
type Zero = Decrement<1>; // 0
// type Error = Decrement<0>; // Likely results in an error or never
```

---

### Increment\<N\>

> **Increment**\<`N`\> = readonly \[`0`, `...MakeTuple<0, N>`\]\[`"length"`\]

Defined in: [type-level-integer/increment.d.mts:11](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/increment.d.mts#L11)

Increments a non-negative integer literal type `N` by 1.
It works by creating a tuple of length `N`, prepending an element, and taking the new length.

#### Type Parameters

##### N

`N` _extends_ `number`

A non-negative integer literal type.

#### Returns

The number literal type `N + 1`.

#### Example

```ts
type Five = Increment<4>; // 5
type One = Increment<0>; // 1
```
