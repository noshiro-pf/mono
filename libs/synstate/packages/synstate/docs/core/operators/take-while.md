[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/take-while

# core/operators/take-while

## Functions

### takeWhile()

> **takeWhile**\<`A`\>(`predicate`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/take-while.mts:67](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/take-while.mts#L67)

Emits values from the source observable while the predicate returns true.
Completes immediately when the predicate returns false.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### predicate

(`value`, `index`) => `boolean`

Function to test each value

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

An operator that takes values while the predicate is true

#### Example

```ts
//  Timeline:
//
//  num$      1     2     3     4     5     6 (ignored)
//  taken$    1     2     3     4     | (completes)
//
//  Explanation:
//  - takeWhile emits values while the predicate returns true
//  - Completes immediately when the predicate returns false
//  - No further values are emitted after completion

const num$ = source<number>();

const taken$ = num$.pipe(takeWhile((x) => x < 5));

const mut_history: number[] = [];

taken$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

num$.next(5); // nothing logged (completes)

assert.deepStrictEqual(mut_history, [1, 2]);

num$.next(6); // nothing logged (already completed)

assert.deepStrictEqual(mut_history, [1, 2]);
```
