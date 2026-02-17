[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/timer

# core/create/timer

## Functions

### timer()

> **timer**(`milliSeconds`, `startManually?`): [`TimerObservable`](../types/observable-family.md#timerobservable)

Defined in: [core/create/timer.mts:22](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/timer.mts#L22)

Creates an observable that emits 0 after a specified delay and then completes.

#### Parameters

##### milliSeconds

`number`

The delay in milliseconds before emission

##### startManually?

`boolean` = `false`

If true, waits for manual start (default: false)

#### Returns

[`TimerObservable`](../types/observable-family.md#timerobservable)

An observable that emits after delay

#### Example

```ts
const delayed$ = timer(1000);

delayed$.subscribe(() => {
  console.log('1 second passed');
});
// After 1 second, logs: 1 second passed
```
