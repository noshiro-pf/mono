[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/skip-until

# core/operators/skip-until

## Functions

### skipUntil()

> **skipUntil**\<`A`\>(`notifier`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/skip-until.mts:61](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/skip-until.mts#L61)

Skips all values from the source observable until the notifier observable emits.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### notifier

[`Observable`](../types/observable.md#observable)\<`unknown`\>

An observable that signals when to start emitting

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

An operator that skips values until the notifier emits

#### Example

```ts
//  Timeline:
//
//  num$          1     2     3     start   4     5     6
//  startNotifier                   X
//  skipped$                                4     5     6
//                |------ skipped -------|
//
//  Explanation:
//  - skipUntil ignores all values until the notifier emits
//  - After the notifier emits, all subsequent values are passed through
//  - Opposite of takeUntil (which completes when notifier emits)

const num$ = source<number>();

const [startNotifier, start_] = createEventEmitter();

const skipped$ = num$.pipe(skipUntil(startNotifier));

const mut_history: number[] = [];

skipped$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // nothing logged

num$.next(2); // nothing logged

assert.deepStrictEqual(mut_history, []);

start_();

num$.next(4); // logs: 4

assert.deepStrictEqual(mut_history, [4]);

num$.next(5); // logs: 5

assert.deepStrictEqual(mut_history, [4, 5]);
```
