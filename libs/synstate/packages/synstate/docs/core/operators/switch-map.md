[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/switch-map

# core/operators/switch-map

## Functions

### switchMap()

> **switchMap**\<`A`, `B`\>(`mapToObservable`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/switch-map.mts:74](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/switch-map.mts#L74)

Projects each source value to an observable, subscribes to it, and emits its values.
When a new value arrives from the source, the previous inner observable is unsubscribed.

#### Type Parameters

##### A

`A`

The type of values from the source

##### B

`B`

The type of values from the projected observable

#### Parameters

##### mapToObservable

(`curr`) => [`Observable`](../types/observable.md#observable)\<`B`\>

A function that maps each source value to an observable

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\>

An operator that switches to new observables

#### Example

```ts
//  Timeline:
//
//  searchQuery$  "a"       "ab"      "abc"
//  requests      fetch1    fetch2    fetch3
//  results$                cancel    cancel    result3
//                          fetch1    fetch2
//
//  Explanation:
//  - switchMap cancels previous inner observables when a new value arrives
//  - Only the result from the latest search query is emitted
//  - Previous ongoing requests are cancelled
//  - Ideal for search-as-you-type scenarios

const searchQuery$ = source<string>();

const results$ = searchQuery$.pipe(
  switchMap((query) => {
    const result$ = source<string[]>();

    setTimeout(() => {
      result$.next([query]);

      result$.complete();
    }, 10);

    return result$;
  }),
);

const mut_history: string[][] = [];

results$.subscribe((value) => {
  mut_history.push(value);
});

searchQuery$.next('a');

searchQuery$.next('ab');

searchQuery$.next('abc');

await new Promise((resolve) => {
  setTimeout(resolve, 200);
});

assert.deepStrictEqual(mut_history, [['abc']]);
```

#### Note

To improve code readability, consider using `createState` instead of `switchMap`,
subscribe to `parentObservable` and call `setState` within it.
