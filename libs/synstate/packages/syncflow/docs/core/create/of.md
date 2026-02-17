[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/create/of

# core/create/of

## Functions

### of()

> **of**\<`A`\>(`value`, `startManually?`): [`OfObservable`](../types/observable-family.md#ofobservable)\<`A`\>

Defined in: [core/create/of.mts:22](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/create/of.mts#L22)

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
const num$ = of(42);

num$.subscribe((x) => {
  console.log(x);
}); // logs: 42
```
