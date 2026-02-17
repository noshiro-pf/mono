[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/operators/pairwise

# core/operators/pairwise

## Functions

### pairwise()

> **pairwise**\<`A`\>(): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `A`\]\>

Defined in: [core/operators/pairwise.mts:34](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/pairwise.mts#L34)

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
const num$ = source<number>();

const pairs$ = num$.pipe(pairwise());

pairs$.subscribe(([prev, curr]) => {
  console.log(prev, curr);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 1, 2

num$.next(3); // logs: 2, 3
```
