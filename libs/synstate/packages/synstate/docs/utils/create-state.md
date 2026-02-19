[**synstate**](../README.md)

***

[synstate](../README.md) / utils/create-state

# utils/create-state

## Functions

### createBooleanState()

> **createBooleanState**(`initialState`): readonly \[[`InitializedObservable`](../core/types/observable.md#initializedobservable)\<`boolean`\>, `Readonly`\<\{ `getSnapshot`: () => `boolean`; `resetState`: () => `boolean`; `setFalse`: () => `void`; `setState`: (`next`) => `boolean`; `setTrue`: () => `void`; `toggle`: () => `boolean`; `updateState`: (`updateFn`) => `boolean`; \}\>\]

Defined in: [utils/create-state.mts:125](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/utils/create-state.mts#L125)

Creates a reactive boolean state with convenient methods for boolean operations.
Extends `createState` with boolean-specific helpers like `toggle`, `setTrue`, and `setFalse`.

#### Parameters

##### initialState

`boolean`

The initial boolean value

#### Returns

readonly \[[`InitializedObservable`](../core/types/observable.md#initializedobservable)\<`boolean`\>, `Readonly`\<\{ `getSnapshot`: () => `boolean`; `resetState`: () => `boolean`; `setFalse`: () => `void`; `setState`: (`next`) => `boolean`; `setTrue`: () => `void`; `toggle`: () => `boolean`; `updateState`: (`updateFn`) => `boolean`; \}\>\]

An object with the state observable and boolean-specific methods

#### Example

```ts
const [state, { setTrue, toggle }] = createBooleanState(false);

const mut_history: boolean[] = [];

state.subscribe((value: boolean) => {
  mut_history.push(value);
});

assert.deepStrictEqual(mut_history, [false]);

setTrue(); // logs: true

assert.deepStrictEqual(mut_history, [false, true]);

toggle(); // logs: false

assert.deepStrictEqual(mut_history, [false, true, false]);

toggle(); // logs: true

assert.deepStrictEqual(mut_history, [false, true, false, true]);
```

***

### createState()

> **createState**\<`S`\>(`initialState`): readonly \[[`InitializedObservable`](../core/types/observable.md#initializedobservable)\<`S`\>, (`v`) => `S`, `Readonly`\<\{ `getSnapshot`: () => `S`; `resetState`: () => `S`; `updateState`: (`updateFn`) => `S`; \}\>\]

Defined in: [utils/create-state.mts:58](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/utils/create-state.mts#L58)

Creates a reactive state container with getter and setter methods.
Provides a simple state management solution with observable state.

#### Type Parameters

##### S

`S`

The type of the state

#### Parameters

##### initialState

`S`

The initial value of the state

#### Returns

readonly \[[`InitializedObservable`](../core/types/observable.md#initializedobservable)\<`S`\>, (`v`) => `S`, `Readonly`\<\{ `getSnapshot`: () => `S`; `resetState`: () => `S`; `updateState`: (`updateFn`) => `S`; \}\>\]

An object containing the state observable and methods to manipulate it

#### Example

```ts
const [state, setState, { updateState, resetState }] = createState(0);

const mut_history: number[] = [];

state.subscribe((value: number) => {
  mut_history.push(value);
});

assert.deepStrictEqual(mut_history, [0]);

setState(10); // logs: 10

assert.deepStrictEqual(mut_history, [0, 10]);

updateState((prev: number) => prev + 1); // logs: 11

assert.deepStrictEqual(mut_history, [0, 10, 11]);

resetState(); // logs: 0

assert.deepStrictEqual(mut_history, [0, 10, 11, 0]);
```
