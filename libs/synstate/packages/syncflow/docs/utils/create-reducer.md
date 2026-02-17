[**syncflow**](../README.md)

***

[syncflow](../README.md) / utils/create-reducer

# utils/create-reducer

## Functions

### createReducer()

> **createReducer**\<`S`, `A`\>(`reducer`, `initialState`): readonly \[[`InitializedObservable`](../core/types/observable.md#initializedobservable)\<`S`\>, (`action`) => `S`, () => `S`\]

Defined in: [utils/create-reducer.mts:34](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/utils/create-reducer.mts#L34)

Creates a reducer-based state management container following the Redux pattern.
Actions are dispatched to update the state according to the reducer function.

#### Type Parameters

##### S

`S`

The type of the state

##### A

`A`

The type of actions

#### Parameters

##### reducer

`Reducer`\<`S`, `A`\>

A pure function that takes current state and action, returns new state

##### initialState

`S`

The initial value of the state

#### Returns

readonly \[[`InitializedObservable`](../core/types/observable.md#initializedobservable)\<`S`\>, (`action`) => `S`, () => `S`\]

An object containing the state observable, dispatch function, and snapshot getter

#### Example

```ts
const [state, dispatch] = createReducer(
  (s, action: Readonly<{ type: 'increment' } | { type: 'decrement' }>) => {
    switch (action.type) {
      case 'increment':
        return s + 1;
      case 'decrement':
        return s - 1;
    }
  },
  0,
);

state.subscribe((value: number) => {
  console.log(value);
});

dispatch({ type: 'increment' }); // logs: 1
```
