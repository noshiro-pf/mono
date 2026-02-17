[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/types/observable-kind

# core/types/observable-kind

## Type Aliases

### ChildObservableKind

> **ChildObservableKind** = `StrictExclude`\<[`ObservableKind`](#observablekind), `"root"`\>

Defined in: [core/types/observable-kind.mts:5](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/types/observable-kind.mts#L5)

***

### ManagerObservableKind

> **ManagerObservableKind** = `StrictExclude`\<[`ObservableKind`](#observablekind), `"sync child"`\>

Defined in: [core/types/observable-kind.mts:3](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/types/observable-kind.mts#L3)

***

### ObservableKind

> **ObservableKind** = `"root"` \| `"sync child"` \| `"async child"`

Defined in: [core/types/observable-kind.mts:1](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/types/observable-kind.mts#L1)
