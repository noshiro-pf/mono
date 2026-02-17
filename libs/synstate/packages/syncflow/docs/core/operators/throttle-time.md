[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/operators/throttle-time

# core/operators/throttle-time

## Functions

### throttleTime()

> **throttleTime**\<`A`\>(`milliSeconds`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/throttle-time.mts:30](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/throttle-time.mts#L30)

Emits the first value, then ignores subsequent values for a specified duration.
After the duration, the next emission is allowed through.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### milliSeconds

`number`

The throttle duration in milliseconds

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

An operator that throttles emissions

#### Example

```ts
const scroll$ = source<Event>();

const throttled$ = scroll$.pipe(throttleTime(1000));

throttled$.subscribe((event_) => {
  console.log(event_);
});
// Emits at most once per second
```
