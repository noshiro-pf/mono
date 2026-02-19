[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/combine/merge

# core/combine/merge

## Functions

### merge()

> **merge**\<`OS`\>(`parents`): [`MergeObservableRefined`](../types/observable-family.md#mergeobservablerefined)\<`OS`\>

Defined in: [core/combine/merge.mts:65](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/combine/merge.mts#L65)

Merges multiple observables into a single observable that emits all values from all sources.
Emits whenever any source observable emits a value.

#### Type Parameters

##### OS

`OS` *extends* readonly \[[`Observable`](../types/observable.md#observable)\<`unknown`\>, [`Observable`](../types/observable.md#observable)\<`unknown`\>\]

Tuple type of source observables

#### Parameters

##### parents

`OS`

Array of observables to merge

#### Returns

[`MergeObservableRefined`](../types/observable-family.md#mergeobservablerefined)\<`OS`\>

A merged observable emitting values from any source

#### Example

```ts
//  Timeline:
//
//  clicks$   c1          c2                    c3
//  keys$               k1          k2                    k3
//  events$   c1        k1    c2    k2          c3        k3
//
//  Explanation:
//  - merge combines multiple observables into one
//  - Emits values from any source as they arrive
//  - Order is preserved based on emission time

const clicks$ = source<string>();

const keys$ = source<string>();

const events$ = merge([clicks$, keys$]);

const mut_history: string[] = [];

events$.subscribe((event_) => {
  mut_history.push(event_);
});

clicks$.next('c1');

assert.deepStrictEqual(mut_history, ['c1']);

keys$.next('k1');

assert.deepStrictEqual(mut_history, ['c1', 'k1']);

clicks$.next('c2');

keys$.next('k2');

assert.deepStrictEqual(mut_history, ['c1', 'k1', 'c2', 'k2']);
```

#### Note

To improve code readability, consider using `createState` instead of `merge`,
subscribing to `parents` and calling `setState` within it.
