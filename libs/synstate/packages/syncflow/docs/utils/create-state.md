[**syncflow**](../README.md)

***

[syncflow](../README.md) / utils/create-state

# utils/create-state

## Functions

### createBooleanState()

> **createBooleanState**(`initialState`): readonly \[[`InitializedObservable`](../core/types/observable.md#initializedobservable)\<`boolean`\>, `Readonly`\<\{ `getSnapshot`: () => `boolean`; `resetState`: () => `boolean`; `setFalse`: () => `void`; `setState`: (`next`) => `boolean`; `setTrue`: () => `void`; `toggle`: () => `boolean`; `updateState`: (`updateFn`) => `boolean`; \}\>\]

Defined in: [utils/create-state.mts:105](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/utils/create-state.mts#L105)

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

state.subscribe((value: boolean) => {
  console.log(value);
}); // logs: false

setTrue(); // logs: true

toggle(); // logs: false

toggle(); // logs: true
```

***

### createState()

> **createState**\<`S`\>(`initialState`): readonly \[[`InitializedObservable`](../core/types/observable.md#initializedobservable)\<`S`\>, (`v`) => `S`, `Readonly`\<\{ `getSnapshot`: () => `S`; `resetState`: () => `S`; `updateState`: (`updateFn`) => `S`; \}\>\]

Defined in: [utils/create-state.mts:48](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/utils/create-state.mts#L48)

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

state.subscribe((value: number) => {
  console.log(value);
}); // logs: 0

setState(10); // logs: 10

updateState((prev: number) => prev + 1); // logs: 11

resetState(); // logs: 0
```
