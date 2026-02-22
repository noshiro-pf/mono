[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/map-with-index

# core/operators/map-with-index

## Functions

### mapWithIndex()

> **mapWithIndex**\<`A`, `B`\>(`mapFn`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/map-with-index.mts:51](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/map-with-index.mts#L51)

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
