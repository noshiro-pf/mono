[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/operators/map-with-index

# core/operators/map-with-index

## Variables

### getKey()

> `const` **getKey**: \<`A`, `K`\>(`key`) => [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\> = `pluck`

Defined in: [core/operators/map-with-index.mts:64](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L64)

#### Type Parameters

##### A

`A`

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\>

***

### withIndex()

> `const` **withIndex**: \<`A`\>() => [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\> = `attachIndex`

Defined in: [core/operators/map-with-index.mts:71](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L71)

#### Type Parameters

##### A

`A`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

## Functions

### attachIndex()

> **attachIndex**\<`A`\>(): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

Defined in: [core/operators/map-with-index.mts:66](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L66)

#### Type Parameters

##### A

`A`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

***

### map()

> **map**\<`A`, `B`\>(`mapFn`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/map-with-index.mts:54](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L54)

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### mapFn

(`x`) => `B`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\>

***

### mapOptional()

> **mapOptional**\<`O`, `B`\>(`mapFn`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`O`, `Optional`\<`B`\>\>

Defined in: [core/operators/map-with-index.mts:90](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L90)

#### Type Parameters

##### O

`O` *extends* `UnknownOptional`

##### B

`B`

#### Parameters

##### mapFn

(`x`) => `B`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`O`, `Optional`\<`B`\>\>

***

### mapResultErr()

> **mapResultErr**\<`R`, `E2`\>(`mapFn`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `Result`\<`UnwrapOk`\<`R`\>, `E2`\>\>

Defined in: [core/operators/map-with-index.mts:100](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L100)

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

##### E2

`E2`

#### Parameters

##### mapFn

(`x`) => `E2`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `Result`\<`UnwrapOk`\<`R`\>, `E2`\>\>

***

### mapResultOk()

> **mapResultOk**\<`R`, `S2`\>(`mapFn`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `Result`\<`S2`, `UnwrapErr`\<`R`\>\>\>

Defined in: [core/operators/map-with-index.mts:95](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L95)

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

##### S2

`S2`

#### Parameters

##### mapFn

(`x`) => `S2`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `Result`\<`S2`, `UnwrapErr`\<`R`\>\>\>

***

### mapTo()

> **mapTo**\<`A`, `B`\>(`value`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/map-with-index.mts:57](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L57)

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### value

`B`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\>

***

### mapWithIndex()

> **mapWithIndex**\<`A`, `B`\>(`mapFn`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/map-with-index.mts:42](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L42)

Transforms each value emitted by the source using a mapping function that also receives the emission index.

#### Type Parameters

##### A

`A`

The type of values from the source

##### B

`B`

The type of mapped values

#### Parameters

##### mapFn

(`x`, `index`) => `B`

A function that maps each value (receives value and index)

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\>

An operator that maps values with index

#### Example

```ts
const num$ = source<number>();

const indexed$ = num$.pipe(mapWithIndex((x, i) => `${i}: ${x}`));

indexed$.subscribe((s) => {
  console.log(s);
});

num$.next(10); // logs: 0: 10

num$.next(20); // logs: 1: 20
```

***

### pluck()

> **pluck**\<`A`, `K`\>(`key`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\>

Defined in: [core/operators/map-with-index.mts:60](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L60)

#### Type Parameters

##### A

`A`

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\>

***

### unwrapOptional()

> **unwrapOptional**\<`O`\>(): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`O`, `Unwrap`\<`O`\> \| `undefined`\>

Defined in: [core/operators/map-with-index.mts:73](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L73)

#### Type Parameters

##### O

`O` *extends* `UnknownOptional`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`O`, `Unwrap`\<`O`\> \| `undefined`\>

***

### unwrapResultErr()

> **unwrapResultErr**\<`R`\>(): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `UnwrapErr`\<`R`\> \| `undefined`\>

Defined in: [core/operators/map-with-index.mts:85](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L85)

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `UnwrapErr`\<`R`\> \| `undefined`\>

***

### unwrapResultOk()

> **unwrapResultOk**\<`R`\>(): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `UnwrapOk`\<`R`\> \| `undefined`\>

Defined in: [core/operators/map-with-index.mts:79](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/map-with-index.mts#L79)

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `UnwrapOk`\<`R`\> \| `undefined`\>
