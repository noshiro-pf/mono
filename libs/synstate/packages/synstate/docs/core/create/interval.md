[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/interval

# core/create/interval

## Functions

### interval()

> **interval**(`milliSeconds`, `startManually?`): [`IntervalObservable`](../types/observable-family.md#intervalobservable)

Defined in: [core/create/interval.mts:48](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/interval.mts#L48)

Creates an observable that emits incremental numbers at a specified interval.
Starts with 0 immediately after subscription, then emits 1, 2, 3, ... every interval.

#### Parameters

##### milliSeconds

`number`

The interval duration in milliseconds

##### startManually?

`boolean`

If true, waits for manual start (default: false)

#### Returns

[`IntervalObservable`](../types/observable-family.md#intervalobservable)

An observable that emits sequential numbers

#### Example

```ts
//  Timeline:
//
//  Time(s)   0     1     2     3     4     5
//  tick$     0     1     2     3     4     5     ...
//
//  Explanation:
//  - interval emits incrementing numbers at specified intervals
//  - Starts at 0 and continues indefinitely
//  - Useful for periodic tasks or animations

const tick$ = interval(100);

const mut_history: number[] = [];

const subscription = tick$.subscribe((count) => {
  mut_history.push(count);
});

await new Promise((resolve) => {
  setTimeout(resolve, 350);
});

subscription.unsubscribe();

assert.isTrue(Arr.isArrayAtLeastLength(mut_history, 3));

assert.deepStrictEqual(mut_history[0], 0);

assert.deepStrictEqual(mut_history[1], 1);

assert.deepStrictEqual(mut_history[2], 2);
```
