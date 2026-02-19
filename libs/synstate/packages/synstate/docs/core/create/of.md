[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/of

# core/create/of

## Functions

### of()

> **of**\<`A`\>(`value`, `startManually?`): [`OfObservable`](../types/observable-family.md#ofobservable)\<`A`\>

Defined in: [core/create/of.mts:41](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/of.mts#L41)

Creates an observable that emits a single value and then completes.

#### Type Parameters

##### A

`A`

The type of the value

#### Parameters

##### value

`A`

The value to emit

##### startManually?

`boolean` = `false`

If true, waits for manual start (default: false)

#### Returns

[`OfObservable`](../types/observable-family.md#ofobservable)\<`A`\>

An observable that emits the value

#### Example

```ts
//  Timeline:
//
//  num$    42  | (completes immediately)
//
//  Explanation:
//  - of creates an observable that emits a single value, then completes
//  - Useful for converting a static value into an observable

const num$ = of(42);

const mut_history: number[] = [];

await new Promise<void>((resolve) => {
  num$.subscribe(
    (x) => {
      mut_history.push(x);
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [42]);
```
