[**synstate-react-hooks**](README.md)

***

[synstate-react-hooks](README.md) / create-boolean-state

# create-boolean-state

## Functions

### createBooleanState()

> **createBooleanState**(`initialState`): readonly \[() => `boolean`, `Readonly`\<\{ `getSnapshot`: () => `boolean`; `resetState`: () => `boolean`; `setFalse`: () => `void`; `setState`: (`next`) => `boolean`; `setTrue`: () => `void`; `state`: `InitializedObservable`\<`boolean`\>; `toggle`: () => `boolean`; `updateState`: (`updateFn`) => `boolean`; \}\>\]

Defined in: [synstate-react-hooks/src/create-boolean-state.mts:7](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate-react-hooks/src/create-boolean-state.mts#L7)

#### Parameters

##### initialState

`boolean`

#### Returns

readonly \[() => `boolean`, `Readonly`\<\{ `getSnapshot`: () => `boolean`; `resetState`: () => `boolean`; `setFalse`: () => `void`; `setState`: (`next`) => `boolean`; `setTrue`: () => `void`; `state`: `InitializedObservable`\<`boolean`\>; `toggle`: () => `boolean`; `updateState`: (`updateFn`) => `boolean`; \}\>\]
