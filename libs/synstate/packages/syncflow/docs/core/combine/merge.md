[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/combine/merge

# core/combine/merge

## Functions

### merge()

> **merge**\<`OS`\>(`parents`): [`MergeObservableRefined`](../types/observable-family.md#mergeobservablerefined)\<`OS`\>

Defined in: [core/combine/merge.mts:39](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/combine/merge.mts#L39)

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
const clicks$ = source<MouseEvent>();

const keys$ = source<KeyboardEvent>();

const events$ = merge([clicks$, keys$]);

events$.subscribe((event_) => {
  console.log(event_);
});
// Logs any mouse click or keyboard event
```

#### Note

To improve code readability, consider using `createState` instead of `merge`,
subscribing to `parents` and calling `setState` within it.
