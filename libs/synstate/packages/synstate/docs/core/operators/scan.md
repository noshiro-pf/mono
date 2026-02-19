[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/scan

# core/operators/scan

## Functions

### scan()

> **scan**\<`A`, `B`\>(`reducer`, `initialValue`): [`WithInitialValueOperator`](../types/observable.md#withinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/scan.mts:60](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/scan.mts#L60)

Applies an accumulator function over the source observable and emits each intermediate result.
Similar to Array.reduce but emits accumulated value after each source emission.

#### Type Parameters

##### A

`A`

The type of values from the source

##### B

`B`

The type of the accumulated value

#### Parameters

##### reducer

(`acc`, `curr`) => `B`

The accumulator function

##### initialValue

`B`

The initial accumulated value (seed)

#### Returns

[`WithInitialValueOperator`](../types/observable.md#withinitialvalueoperator)\<`A`, `B`\>

An operator that accumulates values

#### Example

```ts
//  Timeline (accumulating sum):
//
//  num$    1     2     3     4     5
//  sum$    1     3     6     10    15
//          |     |     |     |     |
//          0+1   1+2   3+3   6+4   10+5
//
//  Explanation:
//  - scan accumulates values over time using a reducer function
//  - Starting with seed value 0, each emission adds to the accumulator
//  - Similar to Array.reduce, but for streams

const num$ = source<number>();

const sum$ = num$.pipe(scan((acc, curr) => acc + curr, 0));

const mut_history: number[] = [];

sum$.subscribe((x) => {
  mut_history.push(x);
});

assert.deepStrictEqual(mut_history, [0]);

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [0, 1]);

num$.next(2); // logs: 3

assert.deepStrictEqual(mut_history, [0, 1, 3]);

num$.next(3); // logs: 6

assert.deepStrictEqual(mut_history, [0, 1, 3, 6]);
```
