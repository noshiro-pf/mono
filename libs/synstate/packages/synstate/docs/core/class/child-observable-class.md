[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/class/child-observable-class

# core/class/child-observable-class

## Classes

### AsyncChildObservableClass

Defined in: [core/class/child-observable-class.mts:74](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L74)

#### Extends

- [`ObservableBaseClass`](observable-base-class.md#observablebaseclass)\<`A`, `"async child"`, `number`\>

#### Type Parameters

##### A

`A`

##### P

`P` *extends* [`NonEmptyUnknownList`](../types/types.md#nonemptyunknownlist)

#### Implements

- [`AsyncChildObservable`](../types/observable.md#asyncchildobservable)\<`A`, `P`\>

#### Constructors

##### Constructor

> **new AsyncChildObservableClass**\<`A`, `P`\>(`__namedParameters`): [`AsyncChildObservableClass`](#asyncchildobservableclass)\<`A`, `P`\>

Defined in: [core/class/child-observable-class.mts:82](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L82)

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth?`: `number`; `initialValue`: `ReturnType`\<[`AsyncChildObservable`](../types/observable.md#asyncchildobservable)\<`A`\>\[`"getSnapshot"`\]\>; `parents`: [`Wrap`](../types/observable.md#wrap)\<`P`\>; \}\>

###### Returns

[`AsyncChildObservableClass`](#asyncchildobservableclass)\<`A`, `P`\>

###### Overrides

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`constructor`](observable-base-class.md#constructor)

#### Properties

##### depth

> `readonly` **depth**: `number`

Defined in: [core/class/observable-base-class.mts:28](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L28)

###### Implementation of

`AsyncChildObservable.depth`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`depth`](observable-base-class.md#depth-1)

##### descendantsIdSet

> `protected` `readonly` **descendantsIdSet**: `MutableSet`\<[`ObservableId`](../types/id.md#observableid)\>

Defined in: [core/class/child-observable-class.mts:80](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L80)

##### id

> `readonly` **id**: [`ObservableId`](../types/id.md#observableid)

Defined in: [core/class/observable-base-class.mts:26](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L26)

###### Implementation of

`AsyncChildObservable.id`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`id`](observable-base-class.md#id)

##### kind

> `readonly` **kind**: `"async child"`

Defined in: [core/class/observable-base-class.mts:27](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L27)

###### Implementation of

`AsyncChildObservable.kind`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`kind`](observable-base-class.md#kind-1)

##### parents

> `readonly` **parents**: `Readonly`\<\{ \[P in string \| number \| symbol\]: Observable\<P\[P\<P\>\]\> \}\>

Defined in: [core/class/child-observable-class.mts:78](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L78)

###### Implementation of

`AsyncChildObservable.parents`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:89](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L89)

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`hasChild`](observable-base-class.md#haschild)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: [core/class/observable-base-class.mts:85](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L85)

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`hasSubscriber`](observable-base-class.md#hassubscriber)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: [core/class/observable-base-class.mts:77](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L77)

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`isCompleted`](observable-base-class.md#iscompleted)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): [`UpdaterSymbol`](../types/id.md#updatersymbol)

Defined in: [core/class/observable-base-class.mts:81](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L81)

###### Returns

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Implementation of

`AsyncChildObservable.updaterSymbol`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`updaterSymbol`](observable-base-class.md#updatersymbol)

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

`AsyncChildObservable.addChild`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`addChild`](observable-base-class.md#addchild)

##### addDescendant()

> **addDescendant**\<`B`\>(`child`): `void`

Defined in: [core/class/child-observable-class.mts:107](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L107)

###### Type Parameters

###### B

`B`

###### Parameters

###### child

[`ChildObservable`](../types/observable.md#childobservable)\<`B`\>

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.addDescendant`

##### complete()

> **complete**(): `void`

Defined in: [core/class/child-observable-class.mts:130](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L130)

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.complete`

###### Overrides

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`complete`](observable-base-class.md#complete)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: [core/class/observable-base-class.mts:73](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L73)

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`getCurrentValue`](observable-base-class.md#getcurrentvalue)

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: [core/class/observable-base-class.mts:69](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L69)

###### Returns

`Optional`\<`A`\>

###### Implementation of

`AsyncChildObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`getSnapshot`](observable-base-class.md#getsnapshot)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:93](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L93)

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasActiveChild`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`hasActiveChild`](observable-base-class.md#hasactivechild)

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

`AsyncChildObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`pipe`](observable-base-class.md#pipe)

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

`AsyncChildObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`pipe`](observable-base-class.md#pipe)

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

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`setNext`](observable-base-class.md#setnext)

##### startUpdate()

> **startUpdate**(`nextValue`): `void`

Defined in: [core/class/child-observable-class.mts:120](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L120)

###### Parameters

###### nextValue

`A`

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

`AsyncChildObservable.subscribe`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`subscribe`](observable-base-class.md#subscribe)

##### tryComplete()

> **tryComplete**(): `void`

Defined in: [core/class/child-observable-class.mts:139](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L139)

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.tryComplete`

###### Overrides

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`tryComplete`](observable-base-class.md#trycomplete)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: [core/class/observable-base-class.mts:108](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L108)

###### Parameters

###### \_updaterSymbol

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.tryUpdate`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`tryUpdate`](observable-base-class.md#tryupdate)

***

### InitializedSyncChildObservableClass

Defined in: [core/class/child-observable-class.mts:197](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L197)

#### Extends

- [`SyncChildObservableClass`](#syncchildobservableclass)\<`A`, `P`\>

#### Type Parameters

##### A

`A`

##### P

`P` *extends* [`NonEmptyUnknownList`](../types/types.md#nonemptyunknownlist)

#### Implements

- [`InitializedSyncChildObservable`](../types/observable.md#initializedsyncchildobservable)\<`A`, `P`\>

#### Constructors

##### Constructor

> **new InitializedSyncChildObservableClass**\<`A`, `P`\>(`__namedParameters`): [`InitializedSyncChildObservableClass`](#initializedsyncchildobservableclass)\<`A`, `P`\>

Defined in: [core/class/child-observable-class.mts:204](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L204)

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth?`: `number`; `initialValue`: `ReturnType`\<[`InitializedSyncChildObservable`](../types/observable.md#initializedsyncchildobservable)\<`A`\>\[`"getSnapshot"`\]\>; `parents`: [`Wrap`](../types/observable.md#wrap)\<`P`\>; \}\>

###### Returns

[`InitializedSyncChildObservableClass`](#initializedsyncchildobservableclass)\<`A`, `P`\>

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`constructor`](#constructor-2)

#### Properties

##### depth

> `readonly` **depth**: `number`

Defined in: [core/class/observable-base-class.mts:28](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L28)

###### Implementation of

`InitializedSyncChildObservable.depth`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`depth`](#depth-2)

##### id

> `readonly` **id**: [`ObservableId`](../types/id.md#observableid)

Defined in: [core/class/observable-base-class.mts:26](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L26)

###### Implementation of

`InitializedSyncChildObservable.id`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`id`](#id-2)

##### kind

> `readonly` **kind**: `"sync child"`

Defined in: [core/class/observable-base-class.mts:27](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L27)

###### Implementation of

`InitializedSyncChildObservable.kind`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`kind`](#kind-2)

##### parents

> `readonly` **parents**: `Readonly`\<\{ \[P in string \| number \| symbol\]: Observable\<P\[P\<P\>\]\> \}\>

Defined in: [core/class/child-observable-class.mts:155](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L155)

###### Implementation of

`InitializedSyncChildObservable.parents`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`parents`](#parents-2)

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:89](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L89)

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasChild`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasChild`](#haschild-2)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: [core/class/observable-base-class.mts:85](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L85)

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasSubscriber`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasSubscriber`](#hassubscriber-2)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: [core/class/observable-base-class.mts:77](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L77)

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.isCompleted`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`isCompleted`](#iscompleted-2)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): [`UpdaterSymbol`](../types/id.md#updatersymbol)

Defined in: [core/class/observable-base-class.mts:81](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L81)

###### Returns

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Implementation of

`InitializedSyncChildObservable.updaterSymbol`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`updaterSymbol`](#updatersymbol-2)

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

`InitializedSyncChildObservable.addChild`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`addChild`](#addchild-2)

##### complete()

> **complete**(): `void`

Defined in: [core/class/child-observable-class.mts:177](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L177)

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.complete`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`complete`](#complete-2)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: [core/class/observable-base-class.mts:73](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L73)

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`getCurrentValue`](#getcurrentvalue-2)

##### getSnapshot()

> **getSnapshot**(): `Some`\<`A`\>

Defined in: [core/class/child-observable-class.mts:216](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L216)

###### Returns

`Some`\<`A`\>

###### Implementation of

`InitializedSyncChildObservable.getSnapshot`

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`getSnapshot`](#getsnapshot-2)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:93](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L93)

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasActiveChild`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasActiveChild`](#hasactivechild-2)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): [`InitializedObservable`](../types/observable.md#initializedobservable)\<`B`\>

Defined in: [core/class/child-observable-class.mts:221](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L221)

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `B`\> | [`WithInitialValueOperator`](../types/observable.md#withinitialvalueoperator)\<`A`, `B`\>

###### Returns

[`InitializedObservable`](../types/observable.md#initializedobservable)\<`B`\>

###### Implementation of

`InitializedSyncChildObservable.pipe`

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`pipe`](#pipe-2)

###### Call Signature

> **pipe**\<`B`\>(`operator`): [`Observable`](../types/observable.md#observable)\<`B`\>

Defined in: [core/class/child-observable-class.mts:225](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L225)

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

[`Operator`](../types/observable.md#operator)\<`A`, `B`\>

###### Returns

[`Observable`](../types/observable.md#observable)\<`B`\>

###### Implementation of

`InitializedSyncChildObservable.pipe`

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`pipe`](#pipe-2)

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

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`setNext`](#setnext-2)

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

`InitializedSyncChildObservable.subscribe`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`subscribe`](#subscribe-2)

##### tryComplete()

> **tryComplete**(): `void`

Defined in: [core/class/child-observable-class.mts:185](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L185)

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.tryComplete`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`tryComplete`](#trycomplete-2)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: [core/class/observable-base-class.mts:108](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L108)

###### Parameters

###### \_updaterSymbol

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.tryUpdate`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`tryUpdate`](#tryupdate-2)

***

### SyncChildObservableClass

Defined in: [core/class/child-observable-class.mts:151](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L151)

#### Extends

- [`ObservableBaseClass`](observable-base-class.md#observablebaseclass)\<`A`, `"sync child"`, `number`\>

#### Extended by

- [`InitializedSyncChildObservableClass`](#initializedsyncchildobservableclass)

#### Type Parameters

##### A

`A`

##### P

`P` *extends* [`NonEmptyUnknownList`](../types/types.md#nonemptyunknownlist)

#### Implements

- [`SyncChildObservable`](../types/observable.md#syncchildobservable)\<`A`, `P`\>

#### Constructors

##### Constructor

> **new SyncChildObservableClass**\<`A`, `P`\>(`__namedParameters`): [`SyncChildObservableClass`](#syncchildobservableclass)\<`A`, `P`\>

Defined in: [core/class/child-observable-class.mts:157](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L157)

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth?`: `number`; `initialValue`: `ReturnType`\<[`SyncChildObservable`](../types/observable.md#syncchildobservable)\<`A`\>\[`"getSnapshot"`\]\>; `parents`: [`Wrap`](../types/observable.md#wrap)\<`P`\>; \}\>

###### Returns

[`SyncChildObservableClass`](#syncchildobservableclass)\<`A`, `P`\>

###### Overrides

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`constructor`](observable-base-class.md#constructor)

#### Properties

##### depth

> `readonly` **depth**: `number`

Defined in: [core/class/observable-base-class.mts:28](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L28)

###### Implementation of

`SyncChildObservable.depth`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`depth`](observable-base-class.md#depth-1)

##### id

> `readonly` **id**: [`ObservableId`](../types/id.md#observableid)

Defined in: [core/class/observable-base-class.mts:26](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L26)

###### Implementation of

`SyncChildObservable.id`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`id`](observable-base-class.md#id)

##### kind

> `readonly` **kind**: `"sync child"`

Defined in: [core/class/observable-base-class.mts:27](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L27)

###### Implementation of

`SyncChildObservable.kind`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`kind`](observable-base-class.md#kind-1)

##### parents

> `readonly` **parents**: `Readonly`\<\{ \[P in string \| number \| symbol\]: Observable\<P\[P\<P\>\]\> \}\>

Defined in: [core/class/child-observable-class.mts:155](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L155)

###### Implementation of

`SyncChildObservable.parents`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:89](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L89)

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`hasChild`](observable-base-class.md#haschild)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: [core/class/observable-base-class.mts:85](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L85)

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`hasSubscriber`](observable-base-class.md#hassubscriber)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: [core/class/observable-base-class.mts:77](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L77)

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`isCompleted`](observable-base-class.md#iscompleted)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): [`UpdaterSymbol`](../types/id.md#updatersymbol)

Defined in: [core/class/observable-base-class.mts:81](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L81)

###### Returns

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Implementation of

`SyncChildObservable.updaterSymbol`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`updaterSymbol`](observable-base-class.md#updatersymbol)

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

`SyncChildObservable.addChild`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`addChild`](observable-base-class.md#addchild)

##### complete()

> **complete**(): `void`

Defined in: [core/class/child-observable-class.mts:177](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L177)

###### Returns

`void`

###### Implementation of

`SyncChildObservable.complete`

###### Overrides

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`complete`](observable-base-class.md#complete)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: [core/class/observable-base-class.mts:73](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L73)

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`getCurrentValue`](observable-base-class.md#getcurrentvalue)

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: [core/class/observable-base-class.mts:69](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L69)

###### Returns

`Optional`\<`A`\>

###### Implementation of

`SyncChildObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`getSnapshot`](observable-base-class.md#getsnapshot)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:93](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L93)

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasActiveChild`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`hasActiveChild`](observable-base-class.md#hasactivechild)

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

`SyncChildObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`pipe`](observable-base-class.md#pipe)

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

`SyncChildObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`pipe`](observable-base-class.md#pipe)

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

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`setNext`](observable-base-class.md#setnext)

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

`SyncChildObservable.subscribe`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`subscribe`](observable-base-class.md#subscribe)

##### tryComplete()

> **tryComplete**(): `void`

Defined in: [core/class/child-observable-class.mts:185](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/child-observable-class.mts#L185)

###### Returns

`void`

###### Implementation of

`SyncChildObservable.tryComplete`

###### Overrides

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`tryComplete`](observable-base-class.md#trycomplete)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: [core/class/observable-base-class.mts:108](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L108)

###### Parameters

###### \_updaterSymbol

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Returns

`void`

###### Implementation of

`SyncChildObservable.tryUpdate`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`tryUpdate`](observable-base-class.md#tryupdate)
