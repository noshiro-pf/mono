[**Documentation**](../README.md)

---

[Documentation](../README.md) / type-level-integer/abs

# type-level-integer/abs

## Type Aliases

### Abs\<N\>

> **Abs**\<`N`\> = [`AbsoluteValue`](#absolutevalue)\<`N`\>

Defined in: [type-level-integer/abs.d.mts:32](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/abs.d.mts#L32)

Shorter alias for `AbsoluteValue<N>`.
Calculates the absolute value of a number literal type `N`.

#### Type Parameters

##### N

`N` _extends_ `number`

The number literal type.

#### Returns

The absolute value of `N` as a number literal type.

#### Example

```ts
type Pos = Abs<10>; // 10
type Neg = Abs<-5>; // 5
```

---

### AbsoluteValue\<N\>

> **AbsoluteValue**\<`N`\> = `N` _extends_ `N` ? `` `${N}` `` _extends_ `` `-${infer P}` `` ? `P` _extends_ `` `${number}` `` ? [`ToNumber`](../others/utils.md#tonumber)\<`P`\> : `never` : `N` : `never`

Defined in: [type-level-integer/abs.d.mts:15](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/abs.d.mts#L15)

Calculates the absolute value of a number literal type `N`.
If `N` is a negative number literal, it returns its positive counterpart.
If `N` is a non-negative number literal, it returns `N` itself.
Handles distribution over union types.

#### Type Parameters

##### N

`N` _extends_ `number`

The number literal type.

#### Returns

The absolute value of `N` as a number literal type.

#### Example

```ts
type Pos = AbsoluteValue<10>; // 10
type Neg = AbsoluteValue<-5>; // 5
type Zero = AbsoluteValue<0>; // 0
type Union = AbsoluteValue<-1 | 2>; // 1 | 2
```
