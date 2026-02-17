[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/types/observable

# core/types/observable

## Type Aliases

### AsyncChildObservable

> **AsyncChildObservable**\<`A`, `P`\> = `ObservableTypeConverter.ToManager`\<`A`, `ObservableTypeConverter.ToChild`\<`A`, `CreateObservableType`\<`A`, `"async child"`\>, `P`\>\>

Defined in: [core/types/observable.mts:103](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L103)

#### Type Parameters

##### A

`A`

##### P

`P` *extends* [`NonEmptyUnknownList`](types.md#nonemptyunknownlist) = [`NonEmptyUnknownList`](types.md#nonemptyunknownlist)

***

### ChildObservable

> **ChildObservable**\<`A`, `P`\> = [`AsyncChildObservable`](#asyncchildobservable)\<`A`, `P`\> \| [`SyncChildObservable`](#syncchildobservable)\<`A`, `P`\>

Defined in: [core/types/observable.mts:116](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L116)

#### Type Parameters

##### A

`A`

##### P

`P` *extends* [`NonEmptyUnknownList`](types.md#nonemptyunknownlist) = [`NonEmptyUnknownList`](types.md#nonemptyunknownlist)

***

### DropInitialValueOperator()

> **DropInitialValueOperator**\<`A`, `B`\> = (`src`) => [`Observable`](#observable)\<`B`\>

Defined in: [core/types/observable.mts:149](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L149)

Type of operator that converts Observable to non-initialized Observable

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### src

[`InitializedObservable`](#initializedobservable)\<`A`\> | [`Observable`](#observable)\<`A`\>

#### Returns

[`Observable`](#observable)\<`B`\>

***

### InitializedAsyncChildObservable

> **InitializedAsyncChildObservable**\<`A`, `P`\> = `ObservableTypeConverter.ToInitialized`\<`A`, [`AsyncChildObservable`](#asyncchildobservable)\<`A`, `P`\>\>

Defined in: [core/types/observable.mts:111](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L111)

#### Type Parameters

##### A

`A`

##### P

`P` *extends* [`NonEmptyUnknownList`](types.md#nonemptyunknownlist) = [`NonEmptyUnknownList`](types.md#nonemptyunknownlist)

***

### InitializedObservable

> **InitializedObservable**\<`A`\> = [`InitializedAsyncChildObservable`](#initializedasyncchildobservable)\<`A`\> \| [`InitializedRootObservable`](#initializedrootobservable)\<`A`\> \| [`InitializedSyncChildObservable`](#initializedsyncchildobservable)\<`A`\>

Defined in: [core/types/observable.mts:134](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L134)

#### Type Parameters

##### A

`A`

***

### InitializedRootObservable

> **InitializedRootObservable**\<`A`\> = `ObservableTypeConverter.ToInitialized`\<`A`, [`RootObservable`](#rootobservable)\<`A`\>\>

Defined in: [core/types/observable.mts:126](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L126)

#### Type Parameters

##### A

`A`

***

### InitializedSyncChildObservable

> **InitializedSyncChildObservable**\<`A`, `P`\> = `ObservableTypeConverter.ToInitialized`\<`A`, [`SyncChildObservable`](#syncchildobservable)\<`A`, `P`\>\>

Defined in: [core/types/observable.mts:98](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L98)

#### Type Parameters

##### A

`A`

##### P

`P` *extends* [`NonEmptyUnknownList`](types.md#nonemptyunknownlist) = [`NonEmptyUnknownList`](types.md#nonemptyunknownlist)

***

### KeepInitialValueOperator()

> **KeepInitialValueOperator**\<`A`, `B`\> = (`src`) => [`InitializedObservable`](#initializedobservable)\<`B`\>

Defined in: [core/types/observable.mts:154](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L154)

Type of operator that preserves whether Observable has initial value

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### src

[`InitializedObservable`](#initializedobservable)\<`A`\>

#### Returns

[`InitializedObservable`](#initializedobservable)\<`B`\>

***

### ManagerObservable

> **ManagerObservable**\<`A`\> = [`AsyncChildObservable`](#asyncchildobservable)\<`A`\> \| [`RootObservable`](#rootobservable)\<`A`\>

Defined in: [core/types/observable.mts:139](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L139)

#### Type Parameters

##### A

`A`

***

### Observable

> **Observable**\<`A`\> = [`AsyncChildObservable`](#asyncchildobservable)\<`A`\> \| [`RootObservable`](#rootobservable)\<`A`\> \| [`SyncChildObservable`](#syncchildobservable)\<`A`\>

Defined in: [core/types/observable.mts:129](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L129)

#### Type Parameters

##### A

`A`

***

### ObservableBase

> **ObservableBase**\<`A`\> = `CreateObservableType`\<`A`, [`ObservableKind`](observable-kind.md#observablekind)\>

Defined in: [core/types/observable.mts:51](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L51)

#### Type Parameters

##### A

`A`

***

### ObservableValue

> **ObservableValue**\<`A`\> = `A` *extends* [`Observable`](#observable)\<infer B\> ? `B` : `never`

Defined in: [core/types/observable.mts:176](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L176)

#### Type Parameters

##### A

`A`

***

### Operator

> **Operator**\<`A`, `B`\> = [`WithInitialValueOperator`](#withinitialvalueoperator)\<`A`, `B`\> \| [`DropInitialValueOperator`](#dropinitialvalueoperator)\<`A`, `B`\> \| [`KeepInitialValueOperator`](#keepinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/types/observable.mts:158](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L158)

#### Type Parameters

##### A

`A`

##### B

`B`

***

### RootObservable

> **RootObservable**\<`A`\> = `ObservableTypeConverter.ToManager`\<`A`, `CreateObservableType`\<`A`, `"root"`\>\>

Defined in: [core/types/observable.mts:121](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L121)

#### Type Parameters

##### A

`A`

***

### SyncChildObservable

> **SyncChildObservable**\<`A`, `P`\> = `ObservableTypeConverter.ToChild`\<`A`, `CreateObservableType`\<`A`, `"sync child"`\>, `P`\>

Defined in: [core/types/observable.mts:89](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L89)

#### Type Parameters

##### A

`A`

##### P

`P` *extends* [`NonEmptyUnknownList`](types.md#nonemptyunknownlist) = [`NonEmptyUnknownList`](types.md#nonemptyunknownlist)

***

### Unwrap

> **Unwrap**\<`A`\> = `Readonly`\<`{ [P in keyof A]: ObservableValue<A[P]> }`\>

Defined in: [core/types/observable.mts:178](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L178)

#### Type Parameters

##### A

`A` *extends* readonly [`Observable`](#observable)\<`unknown`\>[]

***

### WithInitialValueOperator()

> **WithInitialValueOperator**\<`A`, `B`\> = (`src`) => [`InitializedObservable`](#initializedobservable)\<`B`\>

Defined in: [core/types/observable.mts:144](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L144)

Type of operator that converts Observable to InitializedObservable

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### src

[`Observable`](#observable)\<`A`\>

#### Returns

[`InitializedObservable`](#initializedobservable)\<`B`\>

***

### Wrap

> **Wrap**\<`A`\> = `Readonly`\<`{ [P in keyof A]: Observable<A[P]> }`\>

Defined in: [core/types/observable.mts:182](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L182)

#### Type Parameters

##### A

`A` *extends* readonly `unknown`[]

***

### WrapInitialized

> **WrapInitialized**\<`A`\> = `Readonly`\<`{ [P in keyof A]: InitializedObservable<A[P]> }`\>

Defined in: [core/types/observable.mts:186](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L186)

#### Type Parameters

##### A

`A` *extends* readonly `unknown`[]

## Functions

### isChildObservable()

> **isChildObservable**\<`A`\>(`obs`): `obs is ChildObservable<A, NonEmptyUnknownList>`

Defined in: [core/types/observable.mts:171](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L171)

#### Type Parameters

##### A

`A`

#### Parameters

##### obs

[`Observable`](#observable)\<`A`\>

#### Returns

`obs is ChildObservable<A, NonEmptyUnknownList>`

***

### isManagerObservable()

> **isManagerObservable**\<`A`\>(`obs`): `obs is ManagerObservable<A>`

Defined in: [core/types/observable.mts:163](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L163)

#### Type Parameters

##### A

`A`

#### Parameters

##### obs

[`Observable`](#observable)\<`A`\>

#### Returns

`obs is ManagerObservable<A>`

***

### isRootObservable()

> **isRootObservable**\<`A`\>(`obs`): `obs is RootObservable<A>`

Defined in: [core/types/observable.mts:167](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/types/observable.mts#L167)

#### Type Parameters

##### A

`A`

#### Parameters

##### obs

[`Observable`](#observable)\<`A`\>

#### Returns

`obs is RootObservable<A>`
