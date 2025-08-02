[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / others/boolean

# others/boolean

## Type Aliases

### BoolNot\<A\>

> **BoolNot**\<`A`\> = [`TypeEq`](../condition/eq.md#typeeq)\<`A`, `true`\> _extends_ `true` ? `false` : [`TypeEq`](../condition/eq.md#typeeq)\<`A`, `false`\> _extends_ `true` ? `true` : `never`

Defined in: [src/others/boolean.d.mts:24](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/boolean.d.mts#L24)

Performs a logical NOT operation on a boolean literal type `A`.
This is the type-level equivalent of the JavaScript `!` operator.

#### Type Parameters

##### A

`A` _extends_ `boolean`

A boolean literal type (`true` or `false`).

#### Returns

The logical negation of `A`: `false` if `A` is `true`, `true` if `A` is `false`.

#### Example

```ts
type Result1 = BoolNot<true>; // false
type Result2 = BoolNot<false>; // true

// Useful in conditional types
type IsDisabled<T> = T extends { enabled: infer E }
    ? E extends boolean
        ? BoolNot<E>
        : never
    : true;

type Test1 = IsDisabled<{ enabled: true }>; // false
type Test2 = IsDisabled<{ enabled: false }>; // true
```

---

### BoolAnd\<A, B\>

> **BoolAnd**\<`A`, `B`\> = [`TypeEq`](../condition/eq.md#typeeq)\<`A`, `true`\> _extends_ `true` ? [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `true`\> _extends_ `true` ? `true` : [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `false`\> _extends_ `true` ? `false` : `never` : [`TypeEq`](../condition/eq.md#typeeq)\<`A`, `false`\> _extends_ `true` ? [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `true`\> _extends_ `true` ? `false` : [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `false`\> _extends_ `true` ? `false` : `never` : `never`

Defined in: [src/others/boolean.d.mts:57](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/boolean.d.mts#L57)

Performs a logical AND operation on two boolean literal types `A` and `B`.
This is the type-level equivalent of the JavaScript `&&` operator.
Returns `true` only when both operands are `true`.

#### Type Parameters

##### A

`A` _extends_ `boolean`

The first boolean literal type (`true` or `false`).

##### B

`B` _extends_ `boolean`

The second boolean literal type (`true` or `false`).

#### Returns

`true` if both `A` and `B` are `true`, `false` otherwise.

#### Example

```ts
type T_T = BoolAnd<true, true>; // true
type T_F = BoolAnd<true, false>; // false
type F_T = BoolAnd<false, true>; // false
type F_F = BoolAnd<false, false>; // false

// Useful for combining conditions
type HasBothFlags<T> = T extends { flagA: infer A; flagB: infer B }
    ? A extends boolean
        ? B extends boolean
            ? BoolAnd<A, B>
            : false
        : false
    : false;
```

---

### BoolOr\<A, B\>

> **BoolOr**\<`A`, `B`\> = [`TypeEq`](../condition/eq.md#typeeq)\<`A`, `true`\> _extends_ `true` ? [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `true`\> _extends_ `true` ? `true` : [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `false`\> _extends_ `true` ? `true` : `never` : [`TypeEq`](../condition/eq.md#typeeq)\<`A`, `false`\> _extends_ `true` ? [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `true`\> _extends_ `true` ? `true` : [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `false`\> _extends_ `true` ? `false` : `never` : `never`

Defined in: [src/others/boolean.d.mts:100](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/boolean.d.mts#L100)

Performs a logical OR operation on two boolean literal types `A` and `B`.
This is the type-level equivalent of the JavaScript `||` operator.
Returns `true` when at least one operand is `true`.

#### Type Parameters

##### A

`A` _extends_ `boolean`

The first boolean literal type (`true` or `false`).

##### B

`B` _extends_ `boolean`

The second boolean literal type (`true` or `false`).

#### Returns

`true` if either `A` or `B` (or both) is `true`, `false` otherwise.

#### Example

```ts
type T_T = BoolOr<true, true>; // true
type T_F = BoolOr<true, false>; // true
type F_T = BoolOr<false, true>; // true
type F_F = BoolOr<false, false>; // false

// Useful for fallback conditions
type HasAnyFlag<T> = T extends { flagA: infer A; flagB: infer B }
    ? A extends boolean
        ? B extends boolean
            ? BoolOr<A, B>
            : A
        : B extends boolean
          ? B
          : false
    : false;
```

---

### BoolEq\<A, B\>

> **BoolEq**\<`A`, `B`\> = [`TypeEq`](../condition/eq.md#typeeq)\<`A`, `true`\> _extends_ `true` ? [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `true`\> _extends_ `true` ? `true` : [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `false`\> _extends_ `true` ? `false` : `never` : [`TypeEq`](../condition/eq.md#typeeq)\<`A`, `false`\> _extends_ `true` ? [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `true`\> _extends_ `true` ? `false` : [`TypeEq`](../condition/eq.md#typeeq)\<`B`, `false`\> _extends_ `true` ? `true` : `never` : `never`

Defined in: [src/others/boolean.d.mts:126](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/boolean.d.mts#L126)

Performs a logical equality (XNOR) operation on two boolean literal types `A` and `B`.
Returns `true` if both `A` and `B` are the same, `false` otherwise.

#### Type Parameters

##### A

`A` _extends_ `boolean`

The first boolean literal type (`true` or `false`).

##### B

`B` _extends_ `boolean`

The second boolean literal type (`true` or `false`).

#### Example

```ts
type T_T = BoolEq<true, true>; // true
type T_F = BoolEq<true, false>; // false
type F_T = BoolEq<false, true>; // false
type F_F = BoolEq<false, false>; // true
```

---

### BoolNand\<A, B\>

> **BoolNand**\<`A`, `B`\> = [`BoolNot`](#boolnot)\<[`BoolAnd`](#booland)\<`A`, `B`\>\>

Defined in: [src/others/boolean.d.mts:151](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/boolean.d.mts#L151)

Performs a logical NAND (NOT AND) operation on two boolean literal types `A` and `B`.

#### Type Parameters

##### A

`A` _extends_ `boolean`

The first boolean literal type (`true` or `false`).

##### B

`B` _extends_ `boolean`

The second boolean literal type (`true` or `false`).

#### Example

```ts
type T_T = BoolNand<true, true>; // false
type T_F = BoolNand<true, false>; // true
type F_T = BoolNand<false, true>; // true
type F_F = BoolNand<false, false>; // true
```

---

### BoolNor\<A, B\>

> **BoolNor**\<`A`, `B`\> = [`BoolNot`](#boolnot)\<[`BoolOr`](#boolor)\<`A`, `B`\>\>

Defined in: [src/others/boolean.d.mts:163](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/boolean.d.mts#L163)

Performs a logical NOR (NOT OR) operation on two boolean literal types `A` and `B`.

#### Type Parameters

##### A

`A` _extends_ `boolean`

The first boolean literal type (`true` or `false`).

##### B

`B` _extends_ `boolean`

The second boolean literal type (`true` or `false`).

#### Example

```ts
type T_T = BoolNor<true, true>; // false
type T_F = BoolNor<true, false>; // false
type F_T = BoolNor<false, true>; // false
type F_F = BoolNor<false, false>; // true
```

---

### BoolNeq\<A, B\>

> **BoolNeq**\<`A`, `B`\> = [`BoolNot`](#boolnot)\<[`BoolEq`](#booleq)\<`A`, `B`\>\>

Defined in: [src/others/boolean.d.mts:176](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/boolean.d.mts#L176)

Performs a logical inequality (XOR) operation on two boolean literal types `A` and `B`.
Returns `true` if `A` and `B` are different, `false` otherwise.

#### Type Parameters

##### A

`A` _extends_ `boolean`

The first boolean literal type (`true` or `false`).

##### B

`B` _extends_ `boolean`

The second boolean literal type (`true` or `false`).

#### Example

```ts
type T_T = BoolNeq<true, true>; // false
type T_F = BoolNeq<true, false>; // true
type F_T = BoolNeq<false, true>; // true
type F_F = BoolNeq<false, false>; // false
```
