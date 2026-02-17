[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/with-initial-value

# core/operators/with-initial-value

## Functions

### withInitialValue()

> **withInitialValue**\<`A`, `I`\>(`initialValue`): [`WithInitialValueOperator`](../types/observable.md#withinitialvalueoperator)\<`A`, `A` \| `I`\>

Defined in: [core/operators/with-initial-value.mts:36](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/with-initial-value.mts#L36)

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
const num$ = source<number>();

const initialized$ = num$.pipe(withInitialValue(0));

initialized$.subscribe((x) => {
  console.log(x);
}); // immediately logs: 0

num$.next(1); // logs: 1
```
