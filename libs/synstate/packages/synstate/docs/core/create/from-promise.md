[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/from-promise

# core/create/from-promise

## Functions

### fromPromise()

> **fromPromise**\<`A`, `E`\>(`promise`): [`FromPromiseObservable`](../types/observable-family.md#frompromiseobservable)\<`A`, `E`\>

Defined in: [core/create/from-promise.mts:49](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/from-promise.mts#L49)

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
//  Timeline:
//
//  promise     [pending...]  -> resolved/rejected
//  data$                     Ok(value) or Err(error)
//
//  Explanation:
//  - fromPromise converts a Promise into an observable
//  - Emits a Result type: Ok(value) on success, Err(error) on failure
//  - Completes after emitting the result
//  - Useful for integrating async operations into reactive flows

const fetchData = async (): Promise<{ value: number }> => ({ value: 42 });

const data$ = fromPromise(fetchData());

const mut_history: { value: number }[] = [];

await new Promise<void>((resolve) => {
  data$.subscribe(
    (result) => {
      if (Result.isOk(result)) {
        mut_history.push(result.value);
      }
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [{ value: 42 }]);
```
