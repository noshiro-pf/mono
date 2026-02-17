[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/take-until

# core/operators/take-until

## Functions

### takeUntil()

> **takeUntil**\<`A`\>(`notifier`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/take-until.mts:39](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/take-until.mts#L39)

Emits values from the source until the notifier observable emits.
When the notifier emits, this observable completes.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### notifier

[`Observable`](../types/observable.md#observable)\<`unknown`\>

An observable that signals when to complete

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

An operator that takes values until notifier emits

#### Example

```ts
const num$ = source<number>();

const [stopNotifier, stop_] = createEventEmitter();

const limited$ = num$.pipe(takeUntil(stopNotifier));

limited$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(2); // logs: 2

stop_();

num$.next(3); // nothing logged (completed)
```
