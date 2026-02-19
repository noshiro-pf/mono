[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/debounce-time

# core/operators/debounce-time

## Functions

### debounceTime()

> **debounceTime**\<`A`\>(`milliSeconds`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/debounce-time.mts:58](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/debounce-time.mts#L58)

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
//  Timeline (300ms debounce):
//
//  Time(ms)  0     100    200    300    400    500    600   ...   900   1000
//  input$    'h'   'he'   'hel'  'hello'
//  debounced$                                         'hello' (emitted after 300ms silence)
//
//  Explanation:
//  - At 0ms: 'h' is emitted, timer starts
//  - At 100ms: 'he' is emitted, timer resets
//  - At 200ms: 'hel' is emitted, timer resets
//  - At 300ms: 'hello' is emitted, timer resets
//  - At 600ms: No new emission for 300ms, 'hello' is finally emitted

const input$ = source<string>();

const debounced$ = input$.pipe(debounceTime(300));

const mut_history: string[] = [];

debounced$.subscribe((value) => {
  mut_history.push(value);
});

input$.next('h');

input$.next('he');

input$.next('hel');

input$.next('hello');

await new Promise((resolve) => {
  setTimeout(resolve, 400);
});

assert.deepStrictEqual(mut_history, ['hello']);
```
