[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/create/from-array

# core/create/from-array

## Functions

### fromArray()

> **fromArray**\<`A`\>(`values`, `startManually?`): [`FromArrayObservable`](../types/observable-family.md#fromarrayobservable)\<`A`\>

Defined in: [core/create/from-array.mts:23](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/create/from-array.mts#L23)

Creates an observable that emits all values from an array sequentially, then completes.

#### Type Parameters

##### A

`A`

The type of array elements

#### Parameters

##### values

readonly `A`[]

The array of values to emit

##### startManually?

`boolean` = `false`

If true, waits for manual start (default: false)

#### Returns

[`FromArrayObservable`](../types/observable-family.md#fromarrayobservable)\<`A`\>

An observable that emits array values

#### Example

```ts
const nums$ = fromArray([1, 2, 3]);

nums$.subscribe((x) => {
  console.log(x);
});
// logs: 1, 2, 3
```
