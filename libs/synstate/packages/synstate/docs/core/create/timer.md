[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/timer

# core/create/timer

## Functions

### timer()

> **timer**(`milliSeconds`, `startManually?`): [`TimerObservable`](../types/observable-family.md#timerobservable)

Defined in: [core/create/timer.mts:41](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/timer.mts#L41)

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
//  Timeline:
//
//  Time(ms)  0     ...   1000
//  delayed$                X (emits and completes)
//
//  Explanation:
//  - timer emits once after the specified delay, then completes
//  - Useful for delayed actions or timeouts

const delayed$ = timer(100);

const mut_history: number[] = [];

await new Promise<void>((resolve) => {
  delayed$.subscribe(
    () => {
      mut_history.push(1);
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [1]);
```
