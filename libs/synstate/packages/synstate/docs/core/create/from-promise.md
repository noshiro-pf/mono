[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/from-promise

# core/create/from-promise

## Functions

### fromPromise()

> **fromPromise**\<`A`, `E`\>(`promise`): [`FromPromiseObservable`](../types/observable-family.md#frompromiseobservable)\<`A`, `E`\>

Defined in: [core/create/from-promise.mts:27](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/from-promise.mts#L27)

Creates an observable from a Promise.
Emits Result.ok when the promise resolves, or Result.err when it rejects.

#### Type Parameters

##### A

`A`

The type of the resolved value

##### E

`E` = `unknown`

The type of the error

#### Parameters

##### promise

`Readonly`\<`Promise`\<`A`\>\>

The promise to convert to observable

#### Returns

[`FromPromiseObservable`](../types/observable-family.md#frompromiseobservable)\<`A`, `E`\>

An observable that emits the promise result

#### Example

```ts
const data$ = fromPromise(fetch('/api/data').then((r) => r.json()));

data$.subscribe((result) => {
  if (Result.isOk(result)) {
    console.log('Data:', result.value);
  } else {
    console.error('Error:', result.value);
  }
});
```
