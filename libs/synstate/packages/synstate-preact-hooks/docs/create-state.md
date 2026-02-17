[**synstate-preact-hooks**](README.md)

***

[synstate-preact-hooks](README.md) / create-state

# create-state

## Functions

### createState()

> **createState**\<`S`\>(`initialState`): readonly \[() => `S`, (`v`) => `S`, `Readonly`\<\{ `getSnapshot`: () => `S`; `resetState`: () => `S`; `state`: `InitializedObservable`\<`S`\>; `updateState`: (`updateFn`) => `S`; \}\>\]

Defined in: [synstate-preact-hooks/src/create-state.mts:7](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate-preact-hooks/src/create-state.mts#L7)

#### Type Parameters

##### S

`S`

#### Parameters

##### initialState

`S`

#### Returns

readonly \[() => `S`, (`v`) => `S`, `Readonly`\<\{ `getSnapshot`: () => `S`; `resetState`: () => `S`; `state`: `InitializedObservable`\<`S`\>; `updateState`: (`updateFn`) => `S`; \}\>\]
