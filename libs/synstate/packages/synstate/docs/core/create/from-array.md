[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/from-array

# core/create/from-array

## Functions

### fromArray()

> **fromArray**\<`A`\>(`values`, `startManually?`): [`FromArrayObservable`](../types/observable-family.md#fromarrayobservable)\<`A`\>

Defined in: [core/create/from-array.mts:41](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/from-array.mts#L41)

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
//  Timeline:
//
//  nums$     1     2     3     | (completes)
//
//  Explanation:
//  - fromArray creates an observable from an array
//  - Emits all values synchronously, then completes

const nums$ = fromArray([1, 2, 3]);

const mut_history: number[] = [];

await new Promise<void>((resolve) => {
  nums$.subscribe(
    (x) => {
      mut_history.push(x);
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```
