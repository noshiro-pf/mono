[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/types/observable-family

# core/types/observable-family

## Type Aliases

### AuditTimeOperatorObservable

> **AuditTimeOperatorObservable**\<`A`\> = [`AsyncChildObservable`](observable.md#asyncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:241](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L241)

#### Type Parameters

##### A

`A`

***

### CombineObservable

> **CombineObservable**\<`A`\> = `SyncFlowInternals.CombineObservableImpl`\<`A`\>

Defined in: [core/types/observable-family.mts:166](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L166)

#### Type Parameters

##### A

`A` *extends* [`NonEmptyUnknownList`](types.md#nonemptyunknownlist)

***

### CombineObservableRefined

> **CombineObservableRefined**\<`OS`\> = `SyncFlowInternals.CombineObservableRefinedImpl`\<`OS`\>

Defined in: [core/types/observable-family.mts:169](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L169)

#### Type Parameters

##### OS

`OS` *extends* `NonEmptyArray`\<[`Observable`](observable.md#observable)\<`unknown`\>\>

***

### DebounceTimeOperatorObservable

> **DebounceTimeOperatorObservable**\<`A`\> = [`AsyncChildObservable`](observable.md#asyncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:246](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L246)

#### Type Parameters

##### A

`A`

***

### FilterOperatorObservable

> **FilterOperatorObservable**\<`A`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:227](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L227)

#### Type Parameters

##### A

`A`

***

### FromArrayObservable

> **FromArrayObservable**\<`A`\> = `Readonly`\<\{ `emit`: () => [`FromArrayObservable`](#fromarrayobservable)\<`A`\>; \}\> & [`RootObservable`](observable.md#rootobservable)\<`A`\>

Defined in: [core/types/observable-family.mts:31](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L31)

#### Type Parameters

##### A

`A`

***

### FromPromiseObservable

> **FromPromiseObservable**\<`A`, `E`\> = [`RootObservable`](observable.md#rootobservable)\<`Result`\<`A`, `E`\>\>

Defined in: [core/types/observable-family.mts:36](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L36)

#### Type Parameters

##### A

`A`

##### E

`E` = `unknown`

***

### FromSubscribableObservable

> **FromSubscribableObservable**\<`A`, `E`\> = [`RootObservable`](observable.md#rootobservable)\<`Result`\<`A`, `E`\>\>

Defined in: [core/types/observable-family.mts:40](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L40)

#### Type Parameters

##### A

`A`

##### E

`E` = `unknown`

***

### InitializedSourceObservable

> **InitializedSourceObservable**\<`A`\> = `Readonly`\<\{ `next`: (`value`) => `void`; \}\> & [`InitializedRootObservable`](observable.md#initializedrootobservable)\<`A`\>

Defined in: [core/types/observable-family.mts:16](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L16)

#### Type Parameters

##### A

`A`

***

### IntervalObservable

> **IntervalObservable** = `Readonly`\<\{ `start`: () => [`IntervalObservable`](#intervalobservable); \}\> & [`RootObservable`](observable.md#rootobservable)\<`SafeUint`\>

Defined in: [core/types/observable-family.mts:44](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L44)

***

### MapWithIndexOperatorObservable

> **MapWithIndexOperatorObservable**\<`A`, `B`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<`B`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:187](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L187)

#### Type Parameters

##### A

`A`

##### B

`B`

***

### MergeMapOperatorObservable

> **MergeMapOperatorObservable**\<`A`, `B`\> = [`AsyncChildObservable`](observable.md#asyncchildobservable)\<`B`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:256](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L256)

#### Type Parameters

##### A

`A`

##### B

`B`

***

### MergeObservable

> **MergeObservable**\<`A`\> = `SyncFlowInternals.MergeObservableImpl`\<`A`\>

Defined in: [core/types/observable-family.mts:180](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L180)

#### Type Parameters

##### A

`A` *extends* [`NonEmptyUnknownList`](types.md#nonemptyunknownlist)

***

### MergeObservableRefined

> **MergeObservableRefined**\<`OS`\> = `SyncFlowInternals.MergeObservableRefinedImpl`\<`OS`\>

Defined in: [core/types/observable-family.mts:183](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L183)

#### Type Parameters

##### OS

`OS` *extends* `NonEmptyArray`\<[`Observable`](observable.md#observable)\<`unknown`\>\>

***

### OfObservable

> **OfObservable**\<`A`\> = `Readonly`\<\{ `emit`: () => [`OfObservable`](#ofobservable)\<`A`\>; \}\> & [`RootObservable`](observable.md#rootobservable)\<`A`\>

Defined in: [core/types/observable-family.mts:26](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L26)

#### Type Parameters

##### A

`A`

***

### PairwiseOperatorObservable

> **PairwiseOperatorObservable**\<`A`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<readonly \[`A`, `A`\], readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:192](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L192)

#### Type Parameters

##### A

`A`

***

### ScanOperatorObservable

> **ScanOperatorObservable**\<`A`, `B`\> = [`InitializedSyncChildObservable`](observable.md#initializedsyncchildobservable)\<`B`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:61](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L61)

#### Type Parameters

##### A

`A`

##### B

`B`

***

### SkipIfNoChangeOperatorObservable

> **SkipIfNoChangeOperatorObservable**\<`A`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:229](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L229)

#### Type Parameters

##### A

`A`

***

### SkipUntilOperatorObservable

> **SkipUntilOperatorObservable**\<`A`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:212](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L212)

#### Type Parameters

##### A

`A`

***

### SkipWhileOperatorObservable

> **SkipWhileOperatorObservable**\<`A`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:207](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L207)

#### Type Parameters

##### A

`A`

***

### SourceObservable

> **SourceObservable**\<`A`\> = `Readonly`\<\{ `next`: (`value`) => `void`; \}\> & [`RootObservable`](observable.md#rootobservable)\<`A`\>

Defined in: [core/types/observable-family.mts:21](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L21)

#### Type Parameters

##### A

`A`

***

### SwitchMapOperatorObservable

> **SwitchMapOperatorObservable**\<`A`, `B`\> = [`AsyncChildObservable`](observable.md#asyncchildobservable)\<`B`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:251](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L251)

#### Type Parameters

##### A

`A`

##### B

`B`

***

### TakeUntilOperatorObservable

> **TakeUntilOperatorObservable**\<`A`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:202](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L202)

#### Type Parameters

##### A

`A`

***

### TakeWhileOperatorObservable

> **TakeWhileOperatorObservable**\<`A`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:197](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L197)

#### Type Parameters

##### A

`A`

***

### ThrottleTimeOperatorObservable

> **ThrottleTimeOperatorObservable**\<`A`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<`A`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:234](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L234)

#### Type Parameters

##### A

`A`

***

### TimerObservable

> **TimerObservable** = `Readonly`\<\{ `start`: () => [`TimerObservable`](#timerobservable); \}\> & [`RootObservable`](observable.md#rootobservable)\<`0`\>

Defined in: [core/types/observable-family.mts:49](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L49)

***

### WithBufferedFromOperatorObservable

> **WithBufferedFromOperatorObservable**\<`A`, `B`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<readonly \[`A`, readonly `B`[]\], readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:222](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L222)

#### Type Parameters

##### A

`A`

##### B

`B`

***

### WithCurrentValueFromOperatorObservable

> **WithCurrentValueFromOperatorObservable**\<`A`, `B`\> = [`SyncChildObservable`](observable.md#syncchildobservable)\<readonly \[`A`, `B`\], readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:217](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L217)

#### Type Parameters

##### A

`A`

##### B

`B`

***

### WithInitialValueOperatorObservable

> **WithInitialValueOperatorObservable**\<`A`, `I`\> = [`InitializedSyncChildObservable`](observable.md#initializedsyncchildobservable)\<`A` \| `I`, readonly \[`A`\]\>

Defined in: [core/types/observable-family.mts:56](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L56)

#### Type Parameters

##### A

`A`

##### I

`I` = `A`

***

### ZipObservable

> **ZipObservable**\<`A`\> = `SyncFlowInternals.ZipObservableImpl`\<`A`\>

Defined in: [core/types/observable-family.mts:173](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L173)

#### Type Parameters

##### A

`A` *extends* [`NonEmptyUnknownList`](types.md#nonemptyunknownlist)

***

### ZipObservableRefined

> **ZipObservableRefined**\<`OS`\> = `SyncFlowInternals.ZipObservableRefinedImpl`\<`OS`\>

Defined in: [core/types/observable-family.mts:176](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable-family.mts#L176)

#### Type Parameters

##### OS

`OS` *extends* `NonEmptyArray`\<[`Observable`](observable.md#observable)\<`unknown`\>\>
