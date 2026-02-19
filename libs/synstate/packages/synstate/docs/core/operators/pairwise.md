[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/pairwise

# core/operators/pairwise

## Functions

### pairwise()

> **pairwise**\<`A`\>(): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `A`\]\>

Defined in: [core/operators/pairwise.mts:63](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/pairwise.mts#L63)

Emits the previous and current values as a pair.
Does not emit until the source has emitted at least twice.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `A`\]\>

An operator that pairs consecutive values

#### Example

```ts
//  Timeline:
//
//  num$      1     2     3     4
//  pairs$          [1,2] [2,3] [3,4]
//
//  Explanation:
//  - pairwise emits the current and previous values as a tuple
//  - Nothing is emitted for the first value (no previous value yet)
//  - Useful for tracking changes between consecutive values

const num$ = source<number>();

const pairs$ = num$.pipe(pairwise());

const mut_history: (readonly [number, number])[] = [];

pairs$.subscribe(([prev, curr]) => {
  mut_history.push([prev, curr]);
});

num$.next(1); // nothing logged

assert.deepStrictEqual(mut_history, []);

num$.next(2); // logs: 1, 2

assert.deepStrictEqual(mut_history, [[1, 2]]);

num$.next(3); // logs: 2, 3

assert.deepStrictEqual(mut_history, [
  [1, 2],
  [2, 3],
]);

num$.next(4); // logs: 3, 4

assert.deepStrictEqual(mut_history, [
  [1, 2],
  [2, 3],
  [3, 4],
]);
```
