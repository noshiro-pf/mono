[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/interval

# core/create/interval

## Functions

### interval()

> **interval**(`milliSeconds`, `startManually?`): [`IntervalObservable`](../types/observable-family.md#intervalobservable)

Defined in: [core/create/interval.mts:23](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/interval.mts#L23)

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
const tick$ = interval(1000);

tick$.subscribe((count) => {
  console.log(count);
});
// logs: 0, 1, 2, 3, ... every second
```
