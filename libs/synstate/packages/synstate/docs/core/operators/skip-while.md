[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/skip-while

# core/operators/skip-while

## Functions

### skipWhile()

> **skipWhile**\<`A`\>(`predicate`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/skip-while.mts:59](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/skip-while.mts#L59)

Skips values from the source observable while the predicate returns true.
Once the predicate returns false, all subsequent values pass through.

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

An operator that skips values while the predicate is true

#### Example

```ts
//  Timeline:
//
//  num$        1     2     3     4     5     6     7
//  skipped$                      5     6     7
//              |---- skip -----|
//
//  Explanation:
//  - skipWhile skips values while the predicate returns true
//  - Once the predicate returns false, all subsequent values pass through
//  - Unlike filter, the predicate is never checked again after the first false

const num$ = source<number>();

const skipped$ = num$.pipe(skipWhile((x) => x < 5));

const mut_history: number[] = [];

skipped$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // nothing logged

num$.next(2); // nothing logged

num$.next(5); // logs: 5

assert.deepStrictEqual(mut_history, [5]);

num$.next(6); // logs: 6

assert.deepStrictEqual(mut_history, [5, 6]);

num$.next(7); // logs: 7

assert.deepStrictEqual(mut_history, [5, 6, 7]);
```
