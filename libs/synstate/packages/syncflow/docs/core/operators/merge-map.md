[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/operators/merge-map

# core/operators/merge-map

## Variables

### flatMap()

> `const` **flatMap**: \<`A`, `B`\>(`mapToObservable`) => [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\> = `mergeMap`

Defined in: [core/operators/merge-map.mts:48](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/merge-map.mts#L48)

Alias for `mergeMap()`.

Projects each source value to an observable and merges all inner observables.
Unlike `switchMap`, does not cancel previous inner observables.

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

An operator that merges mapped observables

#### Example

```ts
const ids$ = source<number>();

const users$ = ids$.pipe(mergeMap((id) => fromPromise(fetchUser(id))));

users$.subscribe((user) => {
  console.log(user);
});
// All requests run in parallel, results merged as they arrive

const fetchUser = async (id: number): Promise<unknown> => ({ id });
```

#### Note

To improve code readability, consider using `createState` instead of `mergeMap`,
subscribing to `parentObservable` and calling `setState` within it.

#### See

mergeMap

## Functions

### mergeMap()

> **mergeMap**\<`A`, `B`\>(`mapToObservable`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/merge-map.mts:38](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/merge-map.mts#L38)

Projects each source value to an observable and merges all inner observables.
Unlike `switchMap`, does not cancel previous inner observables.

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

An operator that merges mapped observables

#### Example

```ts
const ids$ = source<number>();

const users$ = ids$.pipe(mergeMap((id) => fromPromise(fetchUser(id))));

users$.subscribe((user) => {
  console.log(user);
});
// All requests run in parallel, results merged as they arrive

const fetchUser = async (id: number): Promise<unknown> => ({ id });
```

#### Note

To improve code readability, consider using `createState` instead of `mergeMap`,
subscribing to `parentObservable` and calling `setState` within it.
