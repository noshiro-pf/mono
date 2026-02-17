[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/scan

# core/operators/scan

## Functions

### scan()

> **scan**\<`A`, `B`\>(`reducer`, `initialValue`): [`WithInitialValueOperator`](../types/observable.md#withinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/scan.mts:38](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/scan.mts#L38)

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
const num$ = source<number>();

const sum$ = num$.pipe(scan((acc, curr) => acc + curr, 0));

sum$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(2); // logs: 3

num$.next(3); // logs: 6
```
