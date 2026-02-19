[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/with-initial-value

# core/operators/with-initial-value

## Functions

### withInitialValue()

> **withInitialValue**\<`A`, `I`\>(`initialValue`): [`WithInitialValueOperator`](../types/observable.md#withinitialvalueoperator)\<`A`, `A` \| `I`\>

Defined in: [core/operators/with-initial-value.mts:58](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/with-initial-value.mts#L58)

Provides an initial value for an observable that doesn't have one.
The resulting observable will immediately emit the initial value upon subscription,
and then emit all subsequent values from the source.

#### Type Parameters

##### A

`A`

The type of values from the source

##### I

`I` = `A`

The type of the initial value (defaults to A)

#### Parameters

##### initialValue

`I`

The initial value to emit

#### Returns

[`WithInitialValueOperator`](../types/observable.md#withinitialvalueoperator)\<`A`, `A` \| `I`\>

An operator that sets the initial value

#### Example

```ts
//  Timeline:
//
//  num$             1    2    3
//  withInitial$ 0   1    2    3
//               ^
//               initial value
//
//  Explanation:
//  - withInitialValue provides an initial value before the source emits
//  - Converts an uninitialized observable to an initialized one
//  - Useful when you need a default value immediately

const num$ = source<number>();

const initialized$ = num$.pipe(withInitialValue(0));

const mut_history: number[] = [];

initialized$.subscribe((x) => {
  mut_history.push(x);
});

assert.deepStrictEqual(mut_history, [0]);

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [0, 1]);

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [0, 1, 2]);
```
