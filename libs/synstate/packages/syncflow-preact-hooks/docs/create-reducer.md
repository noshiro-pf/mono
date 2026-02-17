[**syncflow-preact-hooks**](README.md)

***

[syncflow-preact-hooks](README.md) / create-reducer

# create-reducer

## Functions

### createReducer()

> **createReducer**\<`S`, `A`\>(`reducer`, `initialState`): readonly \[() => `S`, (`action`) => `S`, `Readonly`\<\{ `getSnapshot`: () => `S`; `state`: `InitializedObservable`\<`S`\>; \}\>\]

Defined in: [syncflow-preact-hooks/src/create-reducer.mts:7](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow-preact-hooks/src/create-reducer.mts#L7)

#### Type Parameters

##### S

`S`

##### A

`A`

#### Parameters

##### reducer

`Reducer`\<`S`, `A`\>

##### initialState

`S`

#### Returns

readonly \[() => `S`, (`action`) => `S`, `Readonly`\<\{ `getSnapshot`: () => `S`; `state`: `InitializedObservable`\<`S`\>; \}\>\]
