[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/class/observable-base-class

# core/class/observable-base-class

## Classes

### ObservableBaseClass

Defined in: [core/class/observable-base-class.mts:21](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L21)

#### Extended by

- [`AsyncChildObservableClass`](child-observable-class.md#asyncchildobservableclass)
- [`SyncChildObservableClass`](child-observable-class.md#syncchildobservableclass)
- [`RootObservableClass`](root-observable-class.md#rootobservableclass)

#### Type Parameters

##### A

`A`

##### Kind

`Kind` *extends* [`ObservableBase`](../types/observable.md#observablebase)\<`A`\>\[`"kind"`\]

##### Depth

`Depth` *extends* [`ObservableBase`](../types/observable.md#observablebase)\<`A`\>\[`"depth"`\]

#### Implements

- [`ObservableBase`](../types/observable.md#observablebase)\<`A`\>

#### Constructors

##### Constructor

> **new ObservableBaseClass**\<`A`, `Kind`, `Depth`\>(`__namedParameters`): [`ObservableBaseClass`](#observablebaseclass)\<`A`, `Kind`, `Depth`\>

Defined in: [core/class/observable-base-class.mts:35](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L35)

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth`: `Depth`; `initialValue`: `ReturnType`\<[`ObservableBase`](../types/observable.md#observablebase)\<`A`\>\[`"getSnapshot"`\]\>; `kind`: `Kind`; \}\>

###### Returns

[`ObservableBaseClass`](#observablebaseclass)\<`A`, `Kind`, `Depth`\>

#### Properties

##### depth

> `readonly` **depth**: `Depth`

Defined in: [core/class/observable-base-class.mts:28](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L28)

###### Implementation of

`ObservableBase.depth`

##### id

> `readonly` **id**: [`ObservableId`](../types/id.md#observableid)

Defined in: [core/class/observable-base-class.mts:26](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L26)

###### Implementation of

`ObservableBase.id`

##### kind

> `readonly` **kind**: `Kind`

Defined in: [core/class/observable-base-class.mts:27](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L27)

###### Implementation of

`ObservableBase.kind`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:89](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L89)

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasChild`

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: [core/class/observable-base-class.mts:85](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L85)

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasSubscriber`

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: [core/class/observable-base-class.mts:77](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L77)

###### Returns

`boolean`

###### Implementation of

`ObservableBase.isCompleted`

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): [`UpdaterSymbol`](../types/id.md#updatersymbol)

Defined in: [core/class/observable-base-class.mts:81](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L81)

###### Returns

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Implementation of

`ObservableBase.updaterSymbol`

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: [core/class/observable-base-class.mts:61](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L61)

###### Type Parameters

###### B

`B`

###### Parameters

###### child

[`ChildObservable`](../types/observable.md#childobservable)\<`B`\>

###### Returns

`void`

###### Implementation of

`ObservableBase.addChild`

##### complete()

> **complete**(): `void`

Defined in: [core/class/observable-base-class.mts:118](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L118)

###### Returns

`void`

###### Implementation of

`ObservableBase.complete`

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: [core/class/observable-base-class.mts:73](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L73)

###### Returns

`Optional`\<`A`\>

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: [core/class/observable-base-class.mts:69](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L69)

###### Returns

`Optional`\<`A`\>

###### Implementation of

`ObservableBase.getSnapshot`

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:93](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L93)

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasActiveChild`

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): [`InitializedObservable`](../types/observable.md#initializedobservable)\<`B`\>

Defined in: [core/class/observable-base-class.mts:138](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L138)

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

[`WithInitialValueOperator`](../types/observable.md#withinitialvalueoperator)\<`A`, `B`\>

###### Returns

[`InitializedObservable`](../types/observable.md#initializedobservable)\<`B`\>

###### Implementation of

`ObservableBase.pipe`

###### Call Signature

> **pipe**\<`B`\>(`operator`): [`Observable`](../types/observable.md#observable)\<`B`\>

Defined in: [core/class/observable-base-class.mts:139](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L139)

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

[`Operator`](../types/observable.md#operator)\<`A`, `B`\>

###### Returns

[`Observable`](../types/observable.md#observable)\<`B`\>

###### Implementation of

`ObservableBase.pipe`

##### setNext()

> `protected` **setNext**(`nextValue`, `updaterSymbol`): `void`

Defined in: [core/class/observable-base-class.mts:97](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L97)

###### Parameters

###### nextValue

`A`

###### updaterSymbol

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Returns

`void`

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): [`Subscription`](../types/types.md#subscription)

Defined in: [core/class/observable-base-class.mts:147](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L147)

###### Parameters

###### onNext

(`v`) => `void`

###### onComplete?

() => `void`

###### Returns

[`Subscription`](../types/types.md#subscription)

###### Implementation of

`ObservableBase.subscribe`

##### tryComplete()

> **tryComplete**(): `void`

Defined in: [core/class/observable-base-class.mts:112](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L112)

###### Returns

`void`

###### Implementation of

`ObservableBase.tryComplete`

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: [core/class/observable-base-class.mts:108](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L108)

###### Parameters

###### \_updaterSymbol

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Returns

`void`

###### Implementation of

`ObservableBase.tryUpdate`
