[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/map-with-index

# core/operators/map-with-index

## Variables

### getKey()

> `const` **getKey**: \<`A`, `K`\>(`key`) => [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\> = `pluck`

Defined in: [core/operators/map-with-index.mts:79](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L79)

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

Defined in: [core/operators/map-with-index.mts:86](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L86)

#### Type Parameters

##### A

`A`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

## Functions

### attachIndex()

> **attachIndex**\<`A`\>(): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

Defined in: [core/operators/map-with-index.mts:81](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L81)

#### Type Parameters

##### A

`A`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

***

### map()

> **map**\<`A`, `B`\>(`mapFn`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/map-with-index.mts:69](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L69)

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

Defined in: [core/operators/map-with-index.mts:105](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L105)

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

Defined in: [core/operators/map-with-index.mts:115](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L115)

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

Defined in: [core/operators/map-with-index.mts:110](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L110)

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

Defined in: [core/operators/map-with-index.mts:72](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L72)

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

Defined in: [core/operators/map-with-index.mts:57](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L57)

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
//  Timeline:
//
//  num$      "a"      "b"      "c"
//  indexed$  "0: a"   "1: b"   "2: c"
//
//  Explanation:
//  - mapWithIndex transforms each value along with its index
//  - Index starts at 0 and increments with each emission

const num$ = source<string>();

const indexed$ = num$.pipe(mapWithIndex((x, i) => `${i}: ${x}`));

const mut_history: string[] = [];

indexed$.subscribe((s) => {
  mut_history.push(s);
});

num$.next('a'); // 0: a

num$.next('b'); // 1: b

num$.next('c'); // 2: c

assert.deepStrictEqual(mut_history, ['0: a', '1: b', '2: c']);
```

***

### pluck()

> **pluck**\<`A`, `K`\>(`key`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\>

Defined in: [core/operators/map-with-index.mts:75](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L75)

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

Defined in: [core/operators/map-with-index.mts:88](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L88)

#### Type Parameters

##### O

`O` *extends* `UnknownOptional`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`O`, `Unwrap`\<`O`\> \| `undefined`\>

***

### unwrapResultErr()

> **unwrapResultErr**\<`R`\>(): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `UnwrapErr`\<`R`\> \| `undefined`\>

Defined in: [core/operators/map-with-index.mts:100](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L100)

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `UnwrapErr`\<`R`\> \| `undefined`\>

***

### unwrapResultOk()

> **unwrapResultOk**\<`R`\>(): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `UnwrapOk`\<`R`\> \| `undefined`\>

Defined in: [core/operators/map-with-index.mts:94](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L94)

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`R`, `UnwrapOk`\<`R`\> \| `undefined`\>
