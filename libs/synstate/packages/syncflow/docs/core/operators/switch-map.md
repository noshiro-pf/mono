[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/operators/switch-map

# core/operators/switch-map

## Functions

### switchMap()

> **switchMap**\<`A`, `B`\>(`mapToObservable`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/switch-map.mts:40](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/switch-map.mts#L40)

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
const searchQuery$ = source<string>();

const results$ = searchQuery$.pipe(
  switchMap((query) => fromPromise(fetchResults(query))),
);

results$.subscribe((results) => {
  console.log(results);
});
// Only the latest search results are emitted, previous searches are cancelled

const fetchResults = async (_query: string): Promise<readonly unknown[]> => [];
```

#### Note

To improve code readability, consider using `createState` instead of `switchMap`,
subscribe to `parentObservable` and call `setState` within it.
