[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/operators/debounce-time

# core/operators/debounce-time

## Functions

### debounceTime()

> **debounceTime**\<`A`\>(`milliSeconds`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/debounce-time.mts:38](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/debounce-time.mts#L38)

Delays emissions from the source observable until a specified time has passed without another emission.
Useful for handling user input events like typing or scrolling.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### milliSeconds

`number`

The debounce duration in milliseconds

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

An operator that debounces the observable

#### Example

```ts
const input$ = source<string>();

const debounced$ = input$.pipe(debounceTime(300));

debounced$.subscribe((value) => {
  console.log(value);
});

input$.next('h');

input$.next('he');

input$.next('hel');

input$.next('hello');
// After 300ms of silence, logs: hello
```
