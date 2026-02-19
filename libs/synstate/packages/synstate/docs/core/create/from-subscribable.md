[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/from-subscribable

# core/create/from-subscribable

## Functions

### fromSubscribable()

> **fromSubscribable**\<`A`, `E`\>(`subscribable`): [`FromSubscribableObservable`](../types/observable-family.md#fromsubscribableobservable)\<`A`, `E`\>

Defined in: [core/create/from-subscribable.mts:66](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/from-subscribable.mts#L66)

Converts any subscribable object into a SynState Observable.
Works with objects that have a subscribe(onNext, onError, onComplete) method.

#### Type Parameters

##### A

`A`

The type of values from the subscribable

##### E

`E` = `unknown`

The type of errors from the subscribable

#### Parameters

##### subscribable

[`Subscribable`](../types/types.md#subscribable)\<`A`\>

An object with a subscribe method

#### Returns

[`FromSubscribableObservable`](../types/observable-family.md#fromsubscribableobservable)\<`A`, `E`\>

An observable that wraps values in Result type

#### Example

```ts
//  Explanation:
//  - fromSubscribable converts any subscribable object into a SynState Observable
//  - Works with objects that have a subscribe(onNext, onError, onComplete) method
//  - Wraps values in Result type for error handling
//  - Useful for integrating with other reactive libraries or custom subscribables

// Example: Converting a custom subscribable
const customSubscribable = {
  subscribe: (
    onNext: (value: number) => void,
    _onError?: (error: unknown) => void,
    onComplete?: () => void,
  ) => {
    setTimeout(() => {
      onNext(1);

      onNext(2);

      onNext(3);

      onComplete?.();
    }, 0);

    return { unsubscribe: () => {} };
  },
};

const observable$ = fromSubscribable<number>(customSubscribable);

const mut_history: number[] = [];

await new Promise<void>((resolve) => {
  observable$.subscribe(
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

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```
