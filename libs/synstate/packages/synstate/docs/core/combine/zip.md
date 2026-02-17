[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/combine/zip

# core/combine/zip

## Functions

### zip()

> **zip**\<`OS`\>(`parents`): [`ZipObservableRefined`](../types/observable-family.md#zipobservablerefined)\<`OS`\>

Defined in: [core/combine/zip.mts:41](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/combine/zip.mts#L41)

Combines multiple observables by pairing their emissions by index.
Waits for all sources to emit their nth value before emitting the nth tuple.
Completes when any source completes.

#### Type Parameters

##### OS

`OS` *extends* readonly \[[`Observable`](../types/observable.md#observable)\<`unknown`\>, [`Observable`](../types/observable.md#observable)\<`unknown`\>\]

Tuple type of source observables

#### Parameters

##### parents

`OS`

Array of observables to zip

#### Returns

[`ZipObservableRefined`](../types/observable-family.md#zipobservablerefined)\<`OS`\>

A zipped observable emitting tuples of values

#### Example

```ts
const letters$ = fromArray(['a', 'b', 'c']);

const numbers$ = fromArray([1, 2, 3]);

const zipped$ = zip([letters$, numbers$]);

zipped$.subscribe(([letter, num]) => {
  console.log(letter, num);
});
// logs: a 1, b 2, c 3
```
