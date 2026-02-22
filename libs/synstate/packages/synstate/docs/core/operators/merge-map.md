[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/merge-map

# core/operators/merge-map

## Variables

### flatMap()

> `const` **flatMap**: \<`A`, `B`\>(`mapToObservable`) => [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\> = `mergeMap`

Defined in: [core/operators/merge-map.mts:90](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/merge-map.mts#L90)

Alias for `mergeMap`.

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
//  Timeline:
//
//  ids$          1               2               3
//  requests      fetch(1)        fetch(2)        fetch(3)
//  users$        result1         result2         result3
//                (parallel)      (parallel)      (parallel)
//
//  Explanation:
//  - mergeMap runs all inner observables in parallel
//  - Results are emitted as they arrive (may be out of order)
//  - Does NOT cancel previous requests
//  - All requests run concurrently and all results are emitted

const ids$ = source<number>();

const users$ = ids$.pipe(
  mergeMap((id) => {
    const result$ = source<{ id: number }>();

    setTimeout(() => {
      result$.next({ id });

      result$.complete();
    }, 10);

    return result$;
  }),
);

const mut_history: { id: number }[] = [];

users$.subscribe((value) => {
  mut_history.push(value);
});

ids$.next(1);

ids$.next(2);

ids$.next(3);

await new Promise((resolve) => {
  setTimeout(resolve, 200);
});

assert.deepStrictEqual(mut_history.length, 3);

assert.isTrue(mut_history.some((u) => u.id === 1));

assert.isTrue(mut_history.some((u) => u.id === 2));

assert.isTrue(mut_history.some((u) => u.id === 3));
```

#### Note

To improve code readability, consider using `createState` instead of `mergeMap`,
subscribing to `parentObservable` and calling `setState` within it.

#### See

mergeMap

## Functions

### mergeMap()

> **mergeMap**\<`A`, `B`\>(`mapToObservable`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/merge-map.mts:80](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/merge-map.mts#L80)

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
//  Timeline:
//
//  ids$          1               2               3
//  requests      fetch(1)        fetch(2)        fetch(3)
//  users$        result1         result2         result3
//                (parallel)      (parallel)      (parallel)
//
//  Explanation:
//  - mergeMap runs all inner observables in parallel
//  - Results are emitted as they arrive (may be out of order)
//  - Does NOT cancel previous requests
//  - All requests run concurrently and all results are emitted

const ids$ = source<number>();

const users$ = ids$.pipe(
  mergeMap((id) => {
    const result$ = source<{ id: number }>();

    setTimeout(() => {
      result$.next({ id });

      result$.complete();
    }, 10);

    return result$;
  }),
);

const mut_history: { id: number }[] = [];

users$.subscribe((value) => {
  mut_history.push(value);
});

ids$.next(1);

ids$.next(2);

ids$.next(3);

await new Promise((resolve) => {
  setTimeout(resolve, 200);
});

assert.deepStrictEqual(mut_history.length, 3);

assert.isTrue(mut_history.some((u) => u.id === 1));

assert.isTrue(mut_history.some((u) => u.id === 2));

assert.isTrue(mut_history.some((u) => u.id === 3));
```

#### Note

To improve code readability, consider using `createState` instead of `mergeMap`,
subscribing to `parentObservable` and calling `setState` within it.
