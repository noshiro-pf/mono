[**synstate-react-hooks**](README.md)

***

[synstate-react-hooks](README.md) / synstate

# synstate

## Classes

### AsyncChildObservableClass

Defined in: synstate/dist/core/class/child-observable-class.d.mts:3

#### Extends

- [`ObservableBaseClass`](#observablebaseclass)\<`A`, `"async child"`, `number`\>

#### Type Parameters

##### A

`A`

##### P

`P` *extends* `NonEmptyUnknownList`

#### Implements

- `AsyncChildObservable`\<`A`, `P`\>

#### Constructors

##### Constructor

> **new AsyncChildObservableClass**\<`A`, `P`\>(`__namedParameters`): [`AsyncChildObservableClass`](#asyncchildobservableclass)\<`A`, `P`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:7

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth?`: `number`; `initialValue`: `ReturnType`\<`AsyncChildObservable`\<`A`\>\[`"getSnapshot"`\]\>; `parents`: `Wrap`\<`P`\>; \}\>

###### Returns

[`AsyncChildObservableClass`](#asyncchildobservableclass)\<`A`, `P`\>

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`constructor`](#constructor-2)

#### Properties

##### depth

> `readonly` **depth**: `number`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`AsyncChildObservable.depth`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`depth`](#depth-3)

##### descendantsIdSet

> `protected` `readonly` **descendantsIdSet**: `MutableSet`\<`ObservableId`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:6

##### id

> `readonly` **id**: `ObservableId`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`AsyncChildObservable.id`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`id`](#id-2)

##### kind

> `readonly` **kind**: `"async child"`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`AsyncChildObservable.kind`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`kind`](#kind-3)

##### parents

> `readonly` **parents**: `Readonly`\<`{ [P_1 in keyof P]: Observable<P[P_1]> }`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:5

###### Implementation of

`AsyncChildObservable.parents`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasChild`](#haschild-2)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasSubscriber`](#hassubscriber-2)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`isCompleted`](#iscompleted-2)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`AsyncChildObservable.updaterSymbol`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`updaterSymbol`](#updatersymbol-2)

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:12

###### Type Parameters

###### B

`B`

###### Parameters

###### child

`ChildObservable`\<`B`\>

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.addChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`addChild`](#addchild-2)

##### addDescendant()

> **addDescendant**\<`B`\>(`child`): `void`

Defined in: synstate/dist/core/class/child-observable-class.d.mts:12

###### Type Parameters

###### B

`B`

###### Parameters

###### child

`ChildObservable`\<`B`\>

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.addDescendant`

##### complete()

> **complete**(): `void`

Defined in: synstate/dist/core/class/child-observable-class.d.mts:14

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.complete`

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`complete`](#complete-2)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getCurrentValue`](#getcurrentvalue-2)

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:13

###### Returns

`Optional`\<`A`\>

###### Implementation of

`AsyncChildObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getSnapshot`](#getsnapshot-2)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasActiveChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasActiveChild`](#hasactivechild-2)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:24

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`WithInitialValueOperator`\<`A`, `B`\>

###### Returns

`InitializedObservable`\<`B`\>

###### Implementation of

`AsyncChildObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`pipe`](#pipe-2)

###### Call Signature

> **pipe**\<`B`\>(`operator`): `Observable`\<`B`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:25

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`Operator`\<`A`, `B`\>

###### Returns

`Observable`\<`B`\>

###### Implementation of

`AsyncChildObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`pipe`](#pipe-2)

##### setNext()

> `protected` **setNext**(`nextValue`, `updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:20

###### Parameters

###### nextValue

`A`

###### updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`setNext`](#setnext-2)

##### startUpdate()

> **startUpdate**(`nextValue`): `void`

Defined in: synstate/dist/core/class/child-observable-class.d.mts:13

###### Parameters

###### nextValue

`A`

###### Returns

`void`

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): `Subscription`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:26

###### Parameters

###### onNext

(`v`) => `void`

###### onComplete?

() => `void`

###### Returns

`Subscription`

###### Implementation of

`AsyncChildObservable.subscribe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`subscribe`](#subscribe-2)

##### tryComplete()

> **tryComplete**(): `void`

Defined in: synstate/dist/core/class/child-observable-class.d.mts:15

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.tryComplete`

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`tryComplete`](#trycomplete-2)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:21

###### Parameters

###### \_updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.tryUpdate`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`tryUpdate`](#tryupdate-2)

***

### InitializedSyncChildObservableClass

Defined in: synstate/dist/core/class/child-observable-class.d.mts:27

#### Extends

- [`SyncChildObservableClass`](#syncchildobservableclass)\<`A`, `P`\>

#### Type Parameters

##### A

`A`

##### P

`P` *extends* `NonEmptyUnknownList`

#### Implements

- `InitializedSyncChildObservable`\<`A`, `P`\>

#### Constructors

##### Constructor

> **new InitializedSyncChildObservableClass**\<`A`, `P`\>(`__namedParameters`): [`InitializedSyncChildObservableClass`](#initializedsyncchildobservableclass)\<`A`, `P`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:28

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth?`: `number`; `initialValue`: `ReturnType`\<`InitializedSyncChildObservable`\<`A`\>\[`"getSnapshot"`\]\>; `parents`: `Wrap`\<`P`\>; \}\>

###### Returns

[`InitializedSyncChildObservableClass`](#initializedsyncchildobservableclass)\<`A`, `P`\>

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`constructor`](#constructor-4)

#### Properties

##### depth

> `readonly` **depth**: `number`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`InitializedSyncChildObservable.depth`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`depth`](#depth-5)

##### id

> `readonly` **id**: `ObservableId`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`InitializedSyncChildObservable.id`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`id`](#id-4)

##### kind

> `readonly` **kind**: `"sync child"`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`InitializedSyncChildObservable.kind`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`kind`](#kind-5)

##### parents

> `readonly` **parents**: `Readonly`\<`{ [P_1 in keyof P]: Observable<P[P_1]> }`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:18

###### Implementation of

`InitializedSyncChildObservable.parents`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`parents`](#parents-2)

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasChild`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasChild`](#haschild-4)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasSubscriber`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasSubscriber`](#hassubscriber-4)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.isCompleted`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`isCompleted`](#iscompleted-4)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`InitializedSyncChildObservable.updaterSymbol`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`updaterSymbol`](#updatersymbol-4)

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:12

###### Type Parameters

###### B

`B`

###### Parameters

###### child

`ChildObservable`\<`B`\>

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.addChild`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`addChild`](#addchild-4)

##### complete()

> **complete**(): `void`

Defined in: synstate/dist/core/class/child-observable-class.d.mts:24

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.complete`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`complete`](#complete-4)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`getCurrentValue`](#getcurrentvalue-4)

##### getSnapshot()

> **getSnapshot**(): `Some`\<`A`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:33

###### Returns

`Some`\<`A`\>

###### Implementation of

`InitializedSyncChildObservable.getSnapshot`

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`getSnapshot`](#getsnapshot-4)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasActiveChild`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasActiveChild`](#hasactivechild-4)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:34

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`KeepInitialValueOperator`\<`A`, `B`\> | `WithInitialValueOperator`\<`A`, `B`\>

###### Returns

`InitializedObservable`\<`B`\>

###### Implementation of

`InitializedSyncChildObservable.pipe`

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`pipe`](#pipe-4)

###### Call Signature

> **pipe**\<`B`\>(`operator`): `Observable`\<`B`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:35

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`Operator`\<`A`, `B`\>

###### Returns

`Observable`\<`B`\>

###### Implementation of

`InitializedSyncChildObservable.pipe`

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`pipe`](#pipe-4)

##### setNext()

> `protected` **setNext**(`nextValue`, `updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:20

###### Parameters

###### nextValue

`A`

###### updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`setNext`](#setnext-4)

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): `Subscription`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:26

###### Parameters

###### onNext

(`v`) => `void`

###### onComplete?

() => `void`

###### Returns

`Subscription`

###### Implementation of

`InitializedSyncChildObservable.subscribe`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`subscribe`](#subscribe-4)

##### tryComplete()

> **tryComplete**(): `void`

Defined in: synstate/dist/core/class/child-observable-class.d.mts:25

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.tryComplete`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`tryComplete`](#trycomplete-4)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:21

###### Parameters

###### \_updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.tryUpdate`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`tryUpdate`](#tryupdate-4)

***

### ObservableBaseClass

Defined in: synstate/dist/core/class/observable-base-class.d.mts:2

#### Extended by

- [`AsyncChildObservableClass`](#asyncchildobservableclass)
- [`RootObservableClass`](#rootobservableclass)
- [`SyncChildObservableClass`](#syncchildobservableclass)

#### Type Parameters

##### A

`A`

##### Kind

`Kind` *extends* `ObservableBase`\<`A`\>\[`"kind"`\]

##### Depth

`Depth` *extends* `ObservableBase`\<`A`\>\[`"depth"`\]

#### Implements

- `ObservableBase`\<`A`\>

#### Constructors

##### Constructor

> **new ObservableBaseClass**\<`A`, `Kind`, `Depth`\>(`__namedParameters`): [`ObservableBaseClass`](#observablebaseclass)\<`A`, `Kind`, `Depth`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:7

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth`: `Depth`; `initialValue`: `ReturnType`\<`ObservableBase`\<`A`\>\[`"getSnapshot"`\]\>; `kind`: `Kind`; \}\>

###### Returns

[`ObservableBaseClass`](#observablebaseclass)\<`A`, `Kind`, `Depth`\>

#### Properties

##### depth

> `readonly` **depth**: `Depth`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`ObservableBase.depth`

##### id

> `readonly` **id**: `ObservableId`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`ObservableBase.id`

##### kind

> `readonly` **kind**: `Kind`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`ObservableBase.kind`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasChild`

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasSubscriber`

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`ObservableBase.isCompleted`

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`ObservableBase.updaterSymbol`

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:12

###### Type Parameters

###### B

`B`

###### Parameters

###### child

`ChildObservable`\<`B`\>

###### Returns

`void`

###### Implementation of

`ObservableBase.addChild`

##### complete()

> **complete**(): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:23

###### Returns

`void`

###### Implementation of

`ObservableBase.complete`

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:13

###### Returns

`Optional`\<`A`\>

###### Implementation of

`ObservableBase.getSnapshot`

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasActiveChild`

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:24

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`WithInitialValueOperator`\<`A`, `B`\>

###### Returns

`InitializedObservable`\<`B`\>

###### Implementation of

`ObservableBase.pipe`

###### Call Signature

> **pipe**\<`B`\>(`operator`): `Observable`\<`B`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:25

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`Operator`\<`A`, `B`\>

###### Returns

`Observable`\<`B`\>

###### Implementation of

`ObservableBase.pipe`

##### setNext()

> `protected` **setNext**(`nextValue`, `updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:20

###### Parameters

###### nextValue

`A`

###### updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): `Subscription`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:26

###### Parameters

###### onNext

(`v`) => `void`

###### onComplete?

() => `void`

###### Returns

`Subscription`

###### Implementation of

`ObservableBase.subscribe`

##### tryComplete()

> **tryComplete**(): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:22

###### Returns

`void`

###### Implementation of

`ObservableBase.tryComplete`

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:21

###### Parameters

###### \_updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Implementation of

`ObservableBase.tryUpdate`

***

### RootObservableClass

Defined in: synstate/dist/core/class/root-observable-class.d.mts:3

#### Extends

- [`ObservableBaseClass`](#observablebaseclass)\<`A`, `"root"`, `0`\>

#### Type Parameters

##### A

`A`

#### Implements

- `RootObservable`\<`A`\>

#### Constructors

##### Constructor

> **new RootObservableClass**\<`A`\>(`__namedParameters`): [`RootObservableClass`](#rootobservableclass)\<`A`\>

Defined in: synstate/dist/core/class/root-observable-class.d.mts:6

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `initialValue`: `ReturnType`\<`RootObservable`\<`A`\>\[`"getSnapshot"`\]\>; \}\>

###### Returns

[`RootObservableClass`](#rootobservableclass)\<`A`\>

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`constructor`](#constructor-2)

#### Properties

##### \_descendantsIdSet

> `protected` `readonly` **\_descendantsIdSet**: `MutableSet`\<`ObservableId`\>

Defined in: synstate/dist/core/class/root-observable-class.d.mts:5

##### depth

> `readonly` **depth**: `0`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`RootObservable.depth`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`depth`](#depth-3)

##### id

> `readonly` **id**: `ObservableId`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`RootObservable.id`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`id`](#id-2)

##### kind

> `readonly` **kind**: `"root"`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`RootObservable.kind`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`kind`](#kind-3)

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasChild`](#haschild-2)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasSubscriber`](#hassubscriber-2)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`RootObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`isCompleted`](#iscompleted-2)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`RootObservable.updaterSymbol`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`updaterSymbol`](#updatersymbol-2)

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:12

###### Type Parameters

###### B

`B`

###### Parameters

###### child

`ChildObservable`\<`B`\>

###### Returns

`void`

###### Implementation of

`RootObservable.addChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`addChild`](#addchild-2)

##### addDescendant()

> **addDescendant**\<`B`\>(`child`): `void`

Defined in: synstate/dist/core/class/root-observable-class.d.mts:9

###### Type Parameters

###### B

`B`

###### Parameters

###### child

`ChildObservable`\<`B`\>

###### Returns

`void`

###### Implementation of

`RootObservable.addDescendant`

##### complete()

> **complete**(): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:23

###### Returns

`void`

###### Implementation of

`RootObservable.complete`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`complete`](#complete-2)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getCurrentValue`](#getcurrentvalue-2)

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:13

###### Returns

`Optional`\<`A`\>

###### Implementation of

`RootObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getSnapshot`](#getsnapshot-2)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasActiveChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasActiveChild`](#hasactivechild-2)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:24

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`WithInitialValueOperator`\<`A`, `B`\>

###### Returns

`InitializedObservable`\<`B`\>

###### Implementation of

`RootObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`pipe`](#pipe-2)

###### Call Signature

> **pipe**\<`B`\>(`operator`): `Observable`\<`B`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:25

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`Operator`\<`A`, `B`\>

###### Returns

`Observable`\<`B`\>

###### Implementation of

`RootObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`pipe`](#pipe-2)

##### setNext()

> `protected` **setNext**(`nextValue`, `updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:20

###### Parameters

###### nextValue

`A`

###### updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`setNext`](#setnext-2)

##### startUpdate()

> **startUpdate**(`nextValue`): `void`

Defined in: synstate/dist/core/class/root-observable-class.d.mts:10

###### Parameters

###### nextValue

`A`

###### Returns

`void`

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): `Subscription`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:26

###### Parameters

###### onNext

(`v`) => `void`

###### onComplete?

() => `void`

###### Returns

`Subscription`

###### Implementation of

`RootObservable.subscribe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`subscribe`](#subscribe-2)

##### tryComplete()

> **tryComplete**(): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:22

###### Returns

`void`

###### Implementation of

`RootObservable.tryComplete`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`tryComplete`](#trycomplete-2)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:21

###### Parameters

###### \_updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Implementation of

`RootObservable.tryUpdate`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`tryUpdate`](#tryupdate-2)

***

### SyncChildObservableClass

Defined in: synstate/dist/core/class/child-observable-class.d.mts:17

#### Extends

- [`ObservableBaseClass`](#observablebaseclass)\<`A`, `"sync child"`, `number`\>

#### Extended by

- [`InitializedSyncChildObservableClass`](#initializedsyncchildobservableclass)

#### Type Parameters

##### A

`A`

##### P

`P` *extends* `NonEmptyUnknownList`

#### Implements

- `SyncChildObservable`\<`A`, `P`\>

#### Constructors

##### Constructor

> **new SyncChildObservableClass**\<`A`, `P`\>(`__namedParameters`): [`SyncChildObservableClass`](#syncchildobservableclass)\<`A`, `P`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:19

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth?`: `number`; `initialValue`: `ReturnType`\<`SyncChildObservable`\<`A`\>\[`"getSnapshot"`\]\>; `parents`: `Wrap`\<`P`\>; \}\>

###### Returns

[`SyncChildObservableClass`](#syncchildobservableclass)\<`A`, `P`\>

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`constructor`](#constructor-2)

#### Properties

##### depth

> `readonly` **depth**: `number`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`SyncChildObservable.depth`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`depth`](#depth-3)

##### id

> `readonly` **id**: `ObservableId`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`SyncChildObservable.id`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`id`](#id-2)

##### kind

> `readonly` **kind**: `"sync child"`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`SyncChildObservable.kind`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`kind`](#kind-3)

##### parents

> `readonly` **parents**: `Readonly`\<`{ [P_1 in keyof P]: Observable<P[P_1]> }`\>

Defined in: synstate/dist/core/class/child-observable-class.d.mts:18

###### Implementation of

`SyncChildObservable.parents`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasChild`](#haschild-2)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasSubscriber`](#hassubscriber-2)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`isCompleted`](#iscompleted-2)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`SyncChildObservable.updaterSymbol`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`updaterSymbol`](#updatersymbol-2)

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:12

###### Type Parameters

###### B

`B`

###### Parameters

###### child

`ChildObservable`\<`B`\>

###### Returns

`void`

###### Implementation of

`SyncChildObservable.addChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`addChild`](#addchild-2)

##### complete()

> **complete**(): `void`

Defined in: synstate/dist/core/class/child-observable-class.d.mts:24

###### Returns

`void`

###### Implementation of

`SyncChildObservable.complete`

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`complete`](#complete-2)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getCurrentValue`](#getcurrentvalue-2)

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:13

###### Returns

`Optional`\<`A`\>

###### Implementation of

`SyncChildObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getSnapshot`](#getsnapshot-2)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasActiveChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasActiveChild`](#hasactivechild-2)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:24

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`WithInitialValueOperator`\<`A`, `B`\>

###### Returns

`InitializedObservable`\<`B`\>

###### Implementation of

`SyncChildObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`pipe`](#pipe-2)

###### Call Signature

> **pipe**\<`B`\>(`operator`): `Observable`\<`B`\>

Defined in: synstate/dist/core/class/observable-base-class.d.mts:25

###### Type Parameters

###### B

`B`

###### Parameters

###### operator

`Operator`\<`A`, `B`\>

###### Returns

`Observable`\<`B`\>

###### Implementation of

`SyncChildObservable.pipe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`pipe`](#pipe-2)

##### setNext()

> `protected` **setNext**(`nextValue`, `updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:20

###### Parameters

###### nextValue

`A`

###### updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`setNext`](#setnext-2)

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): `Subscription`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:26

###### Parameters

###### onNext

(`v`) => `void`

###### onComplete?

() => `void`

###### Returns

`Subscription`

###### Implementation of

`SyncChildObservable.subscribe`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`subscribe`](#subscribe-2)

##### tryComplete()

> **tryComplete**(): `void`

Defined in: synstate/dist/core/class/child-observable-class.d.mts:25

###### Returns

`void`

###### Implementation of

`SyncChildObservable.tryComplete`

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`tryComplete`](#trycomplete-2)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: synstate/dist/core/class/observable-base-class.d.mts:21

###### Parameters

###### \_updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Implementation of

`SyncChildObservable.tryUpdate`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`tryUpdate`](#tryupdate-2)

## Variables

### attachIndex()

> `const` **attachIndex**: \<`A`\>() => `KeepInitialValueOperator`\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:46

#### Type Parameters

##### A

`A`

#### Returns

`KeepInitialValueOperator`\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

***

### auditTime()

> `const` **auditTime**: \<`A`\>(`milliSeconds`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/audit-time.d.mts:61

Emits the last value from the source observable after a specified time window has passed.
Unlike throttleTime which emits the first value, auditTime emits the last value.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### milliSeconds

`number`

The audit time window in milliseconds

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\>

An operator that audits emissions from the observable

#### Example

```ts
//  Timeline (1000ms audit):
//
//  Time(ms)  0    100   200   300   400   ...   1000  1100
//  input$    e1   e2    e3    e4    e5
//  audited$                                      e5 (emitted at end of window)
//            |-------1000ms window------>        ^
//
//  Explanation:
//  - auditTime emits the LAST value received during each time window
//  - Unlike throttleTime (which emits the FIRST value), audit emits the LAST
//  - At 0-1000ms: e1-e5 are received
//  - At 1000ms: e5 (the last value in the window) is emitted
//  - Useful when you want the most recent value after a burst of events

const input$ = source<number>();

const audited$ = input$.pipe(auditTime(200));

const mut_history: number[] = [];

audited$.subscribe((value) => {
  mut_history.push(value);
});

input$.next(1);

input$.next(2);

input$.next(3);

assert.deepStrictEqual(mut_history, []);

await new Promise((resolve) => {
  setTimeout(resolve, 250);
});

assert.deepStrictEqual(mut_history, [3]);

input$.next(4);

input$.next(5);

await new Promise((resolve) => {
  setTimeout(resolve, 250);
});

assert.deepStrictEqual(mut_history, [3, 5]);
```

***

### binarySearch()

> `const` **binarySearch**: \<`N`\>(`sortedArray`, `x`) => `NegativeInt32` \| `Uint32`

Defined in: synstate/dist/core/utils/utils.d.mts:3

Returns the position where x should be inserted in a sorted array.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### sortedArray

readonly `N`[]

##### x

`N`

#### Returns

`NegativeInt32` \| `Uint32`

***

### combine()

> `const` **combine**: \<`OS`\>(`parents`) => `CombineObservableRefined`\<`OS`\>

Defined in: synstate/dist/core/combine/combine.d.mts:59

Combines multiple observables into a single observable that emits an array of their latest values.
Emits whenever any of the source observables emit, but only after all sources have emitted at least once.

#### Type Parameters

##### OS

`OS` *extends* `NonEmptyArray`\<`Observable`\<`unknown`\>\>

Tuple type of source observables

#### Parameters

##### parents

`OS`

Array of observables to combine

#### Returns

`CombineObservableRefined`\<`OS`\>

A combined observable emitting tuples of values

#### Example

```ts
//  Timeline:
//
//  name$     "Alice"                 "Bob"
//  age$                25                        30
//  user$               ["Alice",25]  ["Bob",25]  ["Bob",30]
//
//  Explanation:
//  - combine waits for all sources to emit at least once
//  - Then emits the latest value from all sources whenever any source emits
//  - Always emits an array with the latest values from each source

const name$ = source<string>();

const age$ = source<number>();

const user$ = combine([name$, age$]);

const mut_history: (readonly [string, number])[] = [];

user$.subscribe(([name_, age]) => {
  mut_history.push([name_, age]);
});

name$.next('Alice'); // nothing logged (age$ hasn't emitted yet)

assert.deepStrictEqual(mut_history, []);

age$.next(25); // logs: { name: 'Alice', age: 25 }

assert.deepStrictEqual(mut_history, [['Alice', 25]]);

name$.next('Bob'); // logs: { name: 'Bob', age: 25 }

assert.deepStrictEqual(mut_history, [
  ['Alice', 25],
  ['Bob', 25],
]);

age$.next(30); // logs: { name: 'Bob', age: 30 }

assert.deepStrictEqual(mut_history, [
  ['Alice', 25],
  ['Bob', 25],
  ['Bob', 30],
]);
```

***

### combineLatest()

> `const` **combineLatest**: \<`OS`\>(`parents`) => `CombineObservableRefined`\<`OS`\>

Defined in: synstate/dist/core/combine/combine.d.mts:64

Alias for `combine()`.

#### Type Parameters

##### OS

`OS` *extends* `NonEmptyArray`\<`Observable`\<`unknown`\>\>

#### Parameters

##### parents

`OS`

#### Returns

`CombineObservableRefined`\<`OS`\>

#### See

combine

***

### createEventEmitter()

> `const` **createEventEmitter**: () => readonly \[`Observable`\<`void`\>, () => `void`\]

Defined in: synstate/dist/utils/create-event-emitter.d.mts:29

Creates an event emitter for void events (events without payload).
Returns a tuple of [observable, emitter function].

#### Returns

readonly \[`Observable`\<`void`\>, () => `void`\]

A tuple containing the observable and the emitter function

#### Example

```ts
const [click$, emitClick] = createEventEmitter();

const mut_clickCount = { value: 0 };

click$.subscribe(() => {
  mut_clickCount.value += 1;
});

emitClick(); // logs: Clicked!

assert.deepStrictEqual(mut_clickCount.value, 1);

emitClick();

emitClick();

assert.deepStrictEqual(mut_clickCount.value, 3);
```

***

### createValueEmitter()

> `const` **createValueEmitter**: \<`A`\>() => readonly \[`Observable`\<`A`\>, (`value`) => `void`\]

Defined in: synstate/dist/utils/create-event-emitter.d.mts:56

Creates an event emitter with typed payload.
Returns a tuple of [observable, emitter function].

#### Type Parameters

##### A

`A`

The type of the event payload

#### Returns

readonly \[`Observable`\<`A`\>, (`value`) => `void`\]

A tuple containing the observable and the emitter function

#### Example

```ts
const [message$, emitMessage] = createValueEmitter<string>();

const mut_history: string[] = [];

message$.subscribe((msg) => {
  mut_history.push(msg);
});

emitMessage('Hello'); // logs: Hello

assert.deepStrictEqual(mut_history, ['Hello']);

emitMessage('World');

assert.deepStrictEqual(mut_history, ['Hello', 'World']);
```

***

### debounceTime()

> `const` **debounceTime**: \<`A`\>(`milliSeconds`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/debounce-time.d.mts:50

Delays emissions from the source observable until a specified time has passed without another emission.
Useful for handling user input events like typing or scrolling.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### milliSeconds

`number`

The debounce duration in milliseconds

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\>

An operator that debounces the observable

#### Example

```ts
//  Timeline (300ms debounce):
//
//  Time(ms)  0     100    200    300    400    500    600   ...   900   1000
//  input$    'h'   'he'   'hel'  'hello'
//  debounced$                                         'hello' (emitted after 300ms silence)
//
//  Explanation:
//  - At 0ms: 'h' is emitted, timer starts
//  - At 100ms: 'he' is emitted, timer resets
//  - At 200ms: 'hel' is emitted, timer resets
//  - At 300ms: 'hello' is emitted, timer resets
//  - At 600ms: No new emission for 300ms, 'hello' is finally emitted

const input$ = source<string>();

const debounced$ = input$.pipe(debounceTime(300));

const mut_history: string[] = [];

debounced$.subscribe((value) => {
  mut_history.push(value);
});

input$.next('h');

input$.next('he');

input$.next('hel');

input$.next('hello');

await new Promise((resolve) => {
  setTimeout(resolve, 400);
});

assert.deepStrictEqual(mut_history, ['hello']);
```

***

### distinctUntilChanged()

> `const` **distinctUntilChanged**: \<`A`\>(`eq?`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/skip-if-no-change.d.mts:56

Alias for `skipIfNoChange()`.

#### Type Parameters

##### A

`A`

#### Parameters

##### eq?

(`x`, `y`) => `boolean`

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\>

#### See

skipIfNoChange

***

### flatMap()

> `const` **flatMap**: \<`A`, `B`\>(`mapToObservable`) => `DropInitialValueOperator`\<`A`, `B`\>

Defined in: synstate/dist/core/operators/merge-map.d.mts:75

Alias for `mergeMap()`.

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### mapToObservable

(`curr`) => `Observable`\<`B`\>

#### Returns

`DropInitialValueOperator`\<`A`, `B`\>

#### See

mergeMap

***

### fromArray()

> `const` **fromArray**: \<`A`\>(`values`, `startManually?`) => `FromArrayObservable`\<`A`\>

Defined in: synstate/dist/core/create/from-array.d.mts:38

Creates an observable that emits all values from an array sequentially, then completes.

#### Type Parameters

##### A

`A`

The type of array elements

#### Parameters

##### values

readonly `A`[]

The array of values to emit

##### startManually?

`boolean`

If true, waits for manual start (default: false)

#### Returns

`FromArrayObservable`\<`A`\>

An observable that emits array values

#### Example

```ts
//  Timeline:
//
//  nums$     1     2     3     | (completes)
//
//  Explanation:
//  - fromArray creates an observable from an array
//  - Emits all values synchronously, then completes

const nums$ = fromArray([1, 2, 3]);

const mut_history: number[] = [];

await new Promise<void>((resolve) => {
  nums$.subscribe(
    (x) => {
      mut_history.push(x);
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```

***

### fromPromise()

> `const` **fromPromise**: \<`A`, `E`\>(`promise`) => `FromPromiseObservable`\<`A`, `E`\>

Defined in: synstate/dist/core/create/from-promise.d.mts:46

Creates an observable from a Promise.
Emits Result.ok when the promise resolves, or Result.err when it rejects.

#### Type Parameters

##### A

`A`

The type of the resolved value

##### E

`E` = `unknown`

The type of the error

#### Parameters

##### promise

`Readonly`\<`Promise`\<`A`\>\>

The promise to convert to observable

#### Returns

`FromPromiseObservable`\<`A`, `E`\>

An observable that emits the promise result

#### Example

```ts
//  Timeline:
//
//  promise     [pending...]  -> resolved/rejected
//  data$                     Ok(value) or Err(error)
//
//  Explanation:
//  - fromPromise converts a Promise into an observable
//  - Emits a Result type: Ok(value) on success, Err(error) on failure
//  - Completes after emitting the result
//  - Useful for integrating async operations into reactive flows

const fetchData = async (): Promise<{ value: number }> => ({ value: 42 });

const data$ = fromPromise(fetchData());

const mut_history: { value: number }[] = [];

await new Promise<void>((resolve) => {
  data$.subscribe(
    (result) => {
      if (Result.isOk(result)) {
        mut_history.push(result.value);
      }
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [{ value: 42 }]);
```

***

### fromSubscribable()

> `const` **fromSubscribable**: \<`A`, `E`\>(`subscribable`) => `FromSubscribableObservable`\<`A`, `E`\>

Defined in: synstate/dist/core/create/from-subscribable.d.mts:60

Converts any subscribable object into a SynState Observable.
Works with objects that have a subscribe(onNext, onError, onComplete) method.

#### Type Parameters

##### A

`A`

The type of values from the subscribable

##### E

`E` = `unknown`

The type of errors from the subscribable

#### Parameters

##### subscribable

`Subscribable`\<`A`\>

An object with a subscribe method

#### Returns

`FromSubscribableObservable`\<`A`, `E`\>

An observable that wraps values in Result type

#### Example

```ts
//  Explanation:
//  - fromSubscribable converts any subscribable object into a SynState Observable
//  - Works with objects that have a subscribe(onNext, onError, onComplete) method
//  - Wraps values in Result type for error handling
//  - Useful for integrating with other reactive libraries or custom subscribables

// Example: Converting a custom subscribable
const customSubscribable = {
  subscribe: (
    onNext: (value: number) => void,
    _onError?: (error: unknown) => void,
    onComplete?: () => void,
  ) => {
    setTimeout(() => {
      onNext(1);

      onNext(2);

      onNext(3);

      onComplete?.();
    }, 0);

    return { unsubscribe: () => {} };
  },
};

const observable$ = fromSubscribable<number>(customSubscribable);

const mut_history: number[] = [];

await new Promise<void>((resolve) => {
  observable$.subscribe(
    (result) => {
      if (Result.isOk(result)) {
        mut_history.push(result.value);
      }
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```

***

### getKey()

> `const` **getKey**: \<`A`, `K`\>(`key`) => `KeepInitialValueOperator`\<`A`, `A`\[`K`\]\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:45

#### Type Parameters

##### A

`A`

##### K

`K` *extends* keyof `A`

#### Parameters

##### key

`K`

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\[`K`\]\>

***

### halfInt()

> `const` **halfInt**: (`x`) => `SafeInt`

Defined in: synstate/dist/core/utils/utils.d.mts:1

#### Parameters

##### x

`SafeInt`

#### Returns

`SafeInt`

***

### interval()

> `const` **interval**: (`milliSeconds`, `startManually?`) => `IntervalObservable`

Defined in: synstate/dist/core/create/interval.d.mts:45

Creates an observable that emits incremental numbers at a specified interval.
Starts with 0 immediately after subscription, then emits 1, 2, 3, ... every interval.

#### Parameters

##### milliSeconds

`number`

The interval duration in milliseconds

##### startManually?

`boolean`

If true, waits for manual start (default: false)

#### Returns

`IntervalObservable`

An observable that emits sequential numbers

#### Example

```ts
//  Timeline:
//
//  Time(s)   0     1     2     3     4     5
//  tick$     0     1     2     3     4     5     ...
//
//  Explanation:
//  - interval emits incrementing numbers at specified intervals
//  - Starts at 0 and continues indefinitely
//  - Useful for periodic tasks or animations

const tick$ = interval(100);

const mut_history: number[] = [];

const subscription = tick$.subscribe((count) => {
  mut_history.push(count);
});

await new Promise((resolve) => {
  setTimeout(resolve, 350);
});

subscription.unsubscribe();

assert.isTrue(Arr.isArrayAtLeastLength(mut_history, 3));

assert.deepStrictEqual(mut_history[0], 0);

assert.deepStrictEqual(mut_history[1], 1);

assert.deepStrictEqual(mut_history[2], 2);
```

***

### isChildObservable()

> `const` **isChildObservable**: \<`A`\>(`obs`) => `obs is ChildObservable<A>`

Defined in: synstate/dist/core/types/observable.d.mts:71

#### Type Parameters

##### A

`A`

#### Parameters

##### obs

`Observable`\<`A`\>

#### Returns

`obs is ChildObservable<A>`

***

### isManagerObservable()

> `const` **isManagerObservable**: \<`A`\>(`obs`) => `obs is ManagerObservable<A>`

Defined in: synstate/dist/core/types/observable.d.mts:69

#### Type Parameters

##### A

`A`

#### Parameters

##### obs

`Observable`\<`A`\>

#### Returns

`obs is ManagerObservable<A>`

***

### isRootObservable()

> `const` **isRootObservable**: \<`A`\>(`obs`) => `obs is RootObservable<A>`

Defined in: synstate/dist/core/types/observable.d.mts:70

#### Type Parameters

##### A

`A`

#### Parameters

##### obs

`Observable`\<`A`\>

#### Returns

`obs is RootObservable<A>`

***

### issueObservableId()

> `const` **issueObservableId**: () => `ObservableId`

Defined in: synstate/dist/core/utils/id-maker.d.mts:2

#### Returns

`ObservableId`

***

### issueSubscriberId()

> `const` **issueSubscriberId**: () => `SubscriberId`

Defined in: synstate/dist/core/utils/id-maker.d.mts:3

#### Returns

`SubscriberId`

***

### issueUpdaterSymbol()

> `const` **issueUpdaterSymbol**: () => `UpdaterSymbol`

Defined in: synstate/dist/core/utils/id-maker.d.mts:4

#### Returns

`UpdaterSymbol`

***

### map()

> `const` **map**: \<`A`, `B`\>(`mapFn`) => `KeepInitialValueOperator`\<`A`, `B`\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:42

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### mapFn

(`x`) => `B`

#### Returns

`KeepInitialValueOperator`\<`A`, `B`\>

***

### mapOptional()

> `const` **mapOptional**: \<`O`, `B`\>(`mapFn`) => `KeepInitialValueOperator`\<`O`, `Optional`\<`B`\>\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:51

#### Type Parameters

##### O

`O` *extends* `UnknownOptional`

##### B

`B`

#### Parameters

##### mapFn

(`x`) => `B`

#### Returns

`KeepInitialValueOperator`\<`O`, `Optional`\<`B`\>\>

***

### mapResultErr()

> `const` **mapResultErr**: \<`R`, `E2`\>(`mapFn`) => `KeepInitialValueOperator`\<`R`, `Result`\<`Result.UnwrapOk`\<`R`\>, `E2`\>\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:53

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

##### E2

`E2`

#### Parameters

##### mapFn

(`x`) => `E2`

#### Returns

`KeepInitialValueOperator`\<`R`, `Result`\<`Result.UnwrapOk`\<`R`\>, `E2`\>\>

***

### mapResultOk()

> `const` **mapResultOk**: \<`R`, `S2`\>(`mapFn`) => `KeepInitialValueOperator`\<`R`, `Result`\<`S2`, `Result.UnwrapErr`\<`R`\>\>\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:52

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

##### S2

`S2`

#### Parameters

##### mapFn

(`x`) => `S2`

#### Returns

`KeepInitialValueOperator`\<`R`, `Result`\<`S2`, `Result.UnwrapErr`\<`R`\>\>\>

***

### mapTo()

> `const` **mapTo**: \<`A`, `B`\>(`value`) => `KeepInitialValueOperator`\<`A`, `B`\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:43

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### value

`B`

#### Returns

`KeepInitialValueOperator`\<`A`, `B`\>

***

### mapWithIndex()

> `const` **mapWithIndex**: \<`A`, `B`\>(`mapFn`) => `KeepInitialValueOperator`\<`A`, `B`\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:41

Transforms each value emitted by the source using a mapping function that also receives the emission index.

#### Type Parameters

##### A

`A`

The type of values from the source

##### B

`B`

The type of mapped values

#### Parameters

##### mapFn

(`x`, `index`) => `B`

A function that maps each value (receives value and index)

#### Returns

`KeepInitialValueOperator`\<`A`, `B`\>

An operator that maps values with index

#### Example

```ts
//  Timeline:
//
//  num$      "a"      "b"      "c"
//  indexed$  "0: a"   "1: b"   "2: c"
//
//  Explanation:
//  - mapWithIndex transforms each value along with its index
//  - Index starts at 0 and increments with each emission

const num$ = source<string>();

const indexed$ = num$.pipe(mapWithIndex((x, i) => `${i}: ${x}`));

const mut_history: string[] = [];

indexed$.subscribe((s) => {
  mut_history.push(s);
});

num$.next('a'); // 0: a

num$.next('b'); // 1: b

num$.next('c'); // 2: c

assert.deepStrictEqual(mut_history, ['0: a', '1: b', '2: c']);
```

***

### maxDepth()

> `const` **maxDepth**: (`parents`) => `number`

Defined in: synstate/dist/core/utils/max-depth.d.mts:2

#### Parameters

##### parents

readonly `Observable`\<`unknown`\>[]

#### Returns

`number`

***

### merge()

> `const` **merge**: \<`OS`\>(`parents`) => `MergeObservableRefined`\<`OS`\>

Defined in: synstate/dist/core/combine/merge.d.mts:53

Merges multiple observables into a single observable that emits all values from all sources.
Emits whenever any source observable emits a value.

#### Type Parameters

##### OS

`OS` *extends* `NonEmptyArray`\<`Observable`\<`unknown`\>\>

Tuple type of source observables

#### Parameters

##### parents

`OS`

Array of observables to merge

#### Returns

`MergeObservableRefined`\<`OS`\>

A merged observable emitting values from any source

#### Example

```ts
//  Timeline:
//
//  clicks$   c1          c2                    c3
//  keys$               k1          k2                    k3
//  events$   c1        k1    c2    k2          c3        k3
//
//  Explanation:
//  - merge combines multiple observables into one
//  - Emits values from any source as they arrive
//  - Order is preserved based on emission time

const clicks$ = source<string>();

const keys$ = source<string>();

const events$ = merge([clicks$, keys$]);

const mut_history: string[] = [];

events$.subscribe((event_) => {
  mut_history.push(event_);
});

clicks$.next('c1');

assert.deepStrictEqual(mut_history, ['c1']);

keys$.next('k1');

assert.deepStrictEqual(mut_history, ['c1', 'k1']);

clicks$.next('c2');

keys$.next('k2');

assert.deepStrictEqual(mut_history, ['c1', 'k1', 'c2', 'k2']);
```

#### Note

To improve code readability, consider using `createState` instead of `merge`,
subscribing to `parents` and calling `setState` within it.

***

### mergeMap()

> `const` **mergeMap**: \<`A`, `B`\>(`mapToObservable`) => `DropInitialValueOperator`\<`A`, `B`\>

Defined in: synstate/dist/core/operators/merge-map.d.mts:70

Projects each source value to an observable and merges all inner observables.
Unlike `switchMap`, does not cancel previous inner observables.

#### Type Parameters

##### A

`A`

The type of values from the source

##### B

`B`

The type of values from the projected observable

#### Parameters

##### mapToObservable

(`curr`) => `Observable`\<`B`\>

A function that maps each source value to an observable

#### Returns

`DropInitialValueOperator`\<`A`, `B`\>

An operator that merges mapped observables

#### Example

```ts
//  Timeline:
//
//  ids$          1               2               3
//  requests      fetch(1)        fetch(2)        fetch(3)
//  users$        result1         result2         result3
//                (parallel)      (parallel)      (parallel)
//
//  Explanation:
//  - mergeMap runs all inner observables in parallel
//  - Results are emitted as they arrive (may be out of order)
//  - Does NOT cancel previous requests
//  - All requests run concurrently and all results are emitted

const ids$ = source<number>();

const users$ = ids$.pipe(
  mergeMap((id) => {
    const result$ = source<{ id: number }>();

    setTimeout(() => {
      result$.next({ id });

      result$.complete();
    }, 10);

    return result$;
  }),
);

const mut_history: { id: number }[] = [];

users$.subscribe((value) => {
  mut_history.push(value);
});

ids$.next(1);

ids$.next(2);

ids$.next(3);

await new Promise((resolve) => {
  setTimeout(resolve, 200);
});

assert.deepStrictEqual(mut_history.length, 3);

assert.isTrue(mut_history.some((u) => u.id === 1));

assert.isTrue(mut_history.some((u) => u.id === 2));

assert.isTrue(mut_history.some((u) => u.id === 3));
```

#### Note

To improve code readability, consider using `createState` instead of `mergeMap`,
subscribing to `parentObservable` and calling `setState` within it.

***

### of()

> `const` **of**: \<`A`\>(`value`, `startManually?`) => `OfObservable`\<`A`\>

Defined in: synstate/dist/core/create/of.d.mts:38

Creates an observable that emits a single value and then completes.

#### Type Parameters

##### A

`A`

The type of the value

#### Parameters

##### value

`A`

The value to emit

##### startManually?

`boolean`

If true, waits for manual start (default: false)

#### Returns

`OfObservable`\<`A`\>

An observable that emits the value

#### Example

```ts
//  Timeline:
//
//  num$    42  | (completes immediately)
//
//  Explanation:
//  - of creates an observable that emits a single value, then completes
//  - Useful for converting a static value into an observable

const num$ = of(42);

const mut_history: number[] = [];

await new Promise<void>((resolve) => {
  num$.subscribe(
    (x) => {
      mut_history.push(x);
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [42]);
```

***

### pairwise()

> `const` **pairwise**: \<`A`\>() => `DropInitialValueOperator`\<`A`, readonly \[`A`, `A`\]\>

Defined in: synstate/dist/core/operators/pairwise.d.mts:55

Emits the previous and current values as a pair.
Does not emit until the source has emitted at least twice.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Returns

`DropInitialValueOperator`\<`A`, readonly \[`A`, `A`\]\>

An operator that pairs consecutive values

#### Example

```ts
//  Timeline:
//
//  num$      1     2     3     4
//  pairs$          [1,2] [2,3] [3,4]
//
//  Explanation:
//  - pairwise emits the current and previous values as a tuple
//  - Nothing is emitted for the first value (no previous value yet)
//  - Useful for tracking changes between consecutive values

const num$ = source<number>();

const pairs$ = num$.pipe(pairwise());

const mut_history: (readonly [number, number])[] = [];

pairs$.subscribe(([prev, curr]) => {
  mut_history.push([prev, curr]);
});

num$.next(1); // nothing logged

assert.deepStrictEqual(mut_history, []);

num$.next(2); // logs: 1, 2

assert.deepStrictEqual(mut_history, [[1, 2]]);

num$.next(3); // logs: 2, 3

assert.deepStrictEqual(mut_history, [
  [1, 2],
  [2, 3],
]);

num$.next(4); // logs: 3, 4

assert.deepStrictEqual(mut_history, [
  [1, 2],
  [2, 3],
  [3, 4],
]);
```

***

### pluck()

> `const` **pluck**: \<`A`, `K`\>(`key`) => `KeepInitialValueOperator`\<`A`, `A`\[`K`\]\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:44

#### Type Parameters

##### A

`A`

##### K

`K` *extends* keyof `A`

#### Parameters

##### key

`K`

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\[`K`\]\>

***

### scan()

> `const` **scan**: \<`A`, `B`\>(`reducer`, `initialValue`) => `WithInitialValueOperator`\<`A`, `B`\>

Defined in: synstate/dist/core/operators/scan.d.mts:51

Applies an accumulator function over the source observable and emits each intermediate result.
Similar to Array.reduce but emits accumulated value after each source emission.

#### Type Parameters

##### A

`A`

The type of values from the source

##### B

`B`

The type of the accumulated value

#### Parameters

##### reducer

(`acc`, `curr`) => `B`

The accumulator function

##### initialValue

`B`

The initial accumulated value (seed)

#### Returns

`WithInitialValueOperator`\<`A`, `B`\>

An operator that accumulates values

#### Example

```ts
//  Timeline (accumulating sum):
//
//  num$    1     2     3     4     5
//  sum$    1     3     6     10    15
//          |     |     |     |     |
//          0+1   1+2   3+3   6+4   10+5
//
//  Explanation:
//  - scan accumulates values over time using a reducer function
//  - Starting with seed value 0, each emission adds to the accumulator
//  - Similar to Array.reduce, but for streams

const num$ = source<number>();

const sum$ = num$.pipe(scan((acc, curr) => acc + curr, 0));

const mut_history: number[] = [];

sum$.subscribe((x) => {
  mut_history.push(x);
});

assert.deepStrictEqual(mut_history, [0]);

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [0, 1]);

num$.next(2); // logs: 3

assert.deepStrictEqual(mut_history, [0, 1, 3]);

num$.next(3); // logs: 6

assert.deepStrictEqual(mut_history, [0, 1, 3, 6]);
```

***

### skip()

> `const` **skip**: \<`A`\>(`n`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/skip-while.d.mts:51

#### Type Parameters

##### A

`A`

#### Parameters

##### n

`PositiveSafeIntWithSmallInt`

#### Returns

`DropInitialValueOperator`\<`A`, `A`\>

***

### skipIfNoChange()

> `const` **skipIfNoChange**: \<`A`\>(`eq?`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/skip-if-no-change.d.mts:51

Skips emissions if the value hasn't changed from the previous emission.
Uses a custom equality function or Object.is by default.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### eq?

(`x`, `y`) => `boolean`

Equality comparison function (default: Object.is)

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\>

An operator that skips duplicate consecutive values

#### Example

```ts
//  Timeline:
//
//  num$      1     1     2     2     2     3
//  distinct$ 1           2                 3
//
//  Explanation:
//  - skipIfNoChange filters out consecutive duplicate values
//  - Uses strict equality (===) for comparison
//  - Only emits when the value actually changes

const num$ = source<number>();

const distinct$ = num$.pipe(skipIfNoChange());

const mut_history: number[] = [];

distinct$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

num$.next(1); // nothing logged

assert.deepStrictEqual(mut_history, [1]);

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

num$.next(2); // nothing logged

num$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```

***

### skipUntil()

> `const` **skipUntil**: \<`A`\>(`notifier`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/skip-until.d.mts:52

Skips all values from the source observable until the notifier observable emits.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### notifier

`Observable`\<`unknown`\>

An observable that signals when to start emitting

#### Returns

`DropInitialValueOperator`\<`A`, `A`\>

An operator that skips values until the notifier emits

#### Example

```ts
//  Timeline:
//
//  num$          1     2     3     start   4     5     6
//  startNotifier                   X
//  skipped$                                4     5     6
//                |------ skipped -------|
//
//  Explanation:
//  - skipUntil ignores all values until the notifier emits
//  - After the notifier emits, all subsequent values are passed through
//  - Opposite of takeUntil (which completes when notifier emits)

const num$ = source<number>();

const [startNotifier, start_] = createEventEmitter();

const skipped$ = num$.pipe(skipUntil(startNotifier));

const mut_history: number[] = [];

skipped$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // nothing logged

num$.next(2); // nothing logged

assert.deepStrictEqual(mut_history, []);

start_();

num$.next(4); // logs: 4

assert.deepStrictEqual(mut_history, [4]);

num$.next(5); // logs: 5

assert.deepStrictEqual(mut_history, [4, 5]);
```

***

### skipWhile()

> `const` **skipWhile**: \<`A`\>(`predicate`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/skip-while.d.mts:50

Skips values from the source observable while the predicate returns true.
Once the predicate returns false, all subsequent values pass through.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### predicate

(`value`, `index`) => `boolean`

Function to test each value

#### Returns

`DropInitialValueOperator`\<`A`, `A`\>

An operator that skips values while the predicate is true

#### Example

```ts
//  Timeline:
//
//  num$        1     2     3     4     5     6     7
//  skipped$                      5     6     7
//              |---- skip -----|
//
//  Explanation:
//  - skipWhile skips values while the predicate returns true
//  - Once the predicate returns false, all subsequent values pass through
//  - Unlike filter, the predicate is never checked again after the first false

const num$ = source<number>();

const skipped$ = num$.pipe(skipWhile((x) => x < 5));

const mut_history: number[] = [];

skipped$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // nothing logged

num$.next(2); // nothing logged

num$.next(5); // logs: 5

assert.deepStrictEqual(mut_history, [5]);

num$.next(6); // logs: 6

assert.deepStrictEqual(mut_history, [5, 6]);

num$.next(7); // logs: 7

assert.deepStrictEqual(mut_history, [5, 6, 7]);
```

***

### subject

> `const` **subject**: *typeof* [`source`](#source)

Defined in: synstate/dist/core/create/source.d.mts:47

Alias for `source()`. Creates a new Observable source.

#### See

source

***

### switchMap()

> `const` **switchMap**: \<`A`, `B`\>(`mapToObservable`) => `DropInitialValueOperator`\<`A`, `B`\>

Defined in: synstate/dist/core/operators/switch-map.d.mts:64

Projects each source value to an observable, subscribes to it, and emits its values.
When a new value arrives from the source, the previous inner observable is unsubscribed.

#### Type Parameters

##### A

`A`

The type of values from the source

##### B

`B`

The type of values from the projected observable

#### Parameters

##### mapToObservable

(`curr`) => `Observable`\<`B`\>

A function that maps each source value to an observable

#### Returns

`DropInitialValueOperator`\<`A`, `B`\>

An operator that switches to new observables

#### Example

```ts
//  Timeline:
//
//  searchQuery$  "a"       "ab"      "abc"
//  requests      fetch1    fetch2    fetch3
//  results$                cancel    cancel    result3
//                          fetch1    fetch2
//
//  Explanation:
//  - switchMap cancels previous inner observables when a new value arrives
//  - Only the result from the latest search query is emitted
//  - Previous ongoing requests are cancelled
//  - Ideal for search-as-you-type scenarios

const searchQuery$ = source<string>();

const results$ = searchQuery$.pipe(
  switchMap((query) => {
    const result$ = source<string[]>();

    setTimeout(() => {
      result$.next([query]);

      result$.complete();
    }, 10);

    return result$;
  }),
);

const mut_history: string[][] = [];

results$.subscribe((value) => {
  mut_history.push(value);
});

searchQuery$.next('a');

searchQuery$.next('ab');

searchQuery$.next('abc');

await new Promise((resolve) => {
  setTimeout(resolve, 200);
});

assert.deepStrictEqual(mut_history, [['abc']]);
```

#### Note

To improve code readability, consider using `createState` instead of `switchMap`,
subscribe to `parentObservable` and call `setState` within it.

***

### take()

> `const` **take**: \<`A`\>(`n`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/take-while.d.mts:50

#### Type Parameters

##### A

`A`

#### Parameters

##### n

`PositiveSafeIntWithSmallInt`

#### Returns

`DropInitialValueOperator`\<`A`, `A`\>

***

### takeUntil()

> `const` **takeUntil**: \<`A`\>(`notifier`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/take-until.d.mts:50

Emits values from the source until the notifier observable emits.
When the notifier emits, this observable completes.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### notifier

`Observable`\<`unknown`\>

An observable that signals when to complete

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\>

An operator that takes values until notifier emits

#### Example

```ts
//  Timeline:
//
//  num$          1         2         stop      3 (ignored)
//  stopNotifier                      X
//  limited$      1         2         |------- (completed)
//
//  Explanation:
//  - takeUntil completes the observable when the notifier emits
//  - After stop() is called, no further values are emitted
//  - Useful for cleanup and cancellation patterns

const num$ = source<number>();

const [stopNotifier, stop_] = createEventEmitter();

const limited$ = num$.pipe(takeUntil(stopNotifier));

const mut_history: number[] = [];

limited$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

stop_();

num$.next(3); // nothing logged (completed)

assert.deepStrictEqual(mut_history, [1, 2]);
```

***

### takeWhile()

> `const` **takeWhile**: \<`A`\>(`predicate`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/take-while.d.mts:49

Emits values from the source observable while the predicate returns true.
Completes immediately when the predicate returns false.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### predicate

(`value`, `index`) => `boolean`

Function to test each value

#### Returns

`DropInitialValueOperator`\<`A`, `A`\>

An operator that takes values while the predicate is true

#### Example

```ts
//  Timeline:
//
//  num$      1     2     3     4     5     6 (ignored)
//  taken$    1     2     3     4     | (completes)
//
//  Explanation:
//  - takeWhile emits values while the predicate returns true
//  - Completes immediately when the predicate returns false
//  - No further values are emitted after completion

const num$ = source<number>();

const taken$ = num$.pipe(takeWhile((x) => x < 5));

const mut_history: number[] = [];

taken$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

num$.next(5); // nothing logged (completes)

assert.deepStrictEqual(mut_history, [1, 2]);

num$.next(6); // nothing logged (already completed)

assert.deepStrictEqual(mut_history, [1, 2]);
```

***

### throttleTime()

> `const` **throttleTime**: \<`A`\>(`milliSeconds`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/throttle-time.d.mts:61

Emits the first value, then ignores subsequent values for a specified duration.
After the duration, the next emission is allowed through.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### milliSeconds

`number`

The throttle duration in milliseconds

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\>

An operator that throttles emissions

#### Example

```ts
//  Timeline (1000ms throttle):
//
//  Time(ms)  0    100   200   300   ...   1000  1100  1200  ...   2000  2100
//  scroll$   e1   e2    e3    e4          e5    e6    e7          e8    e9
//  throttled$ e1                          e5                      e8
//             |-------1000ms------>       |------1000ms------>    |------1000ms------>
//
//  Explanation:
//  - throttleTime emits the first value immediately, then ignores subsequent values
//    for the specified duration (1000ms)
//  - At 0ms: e1 is emitted immediately
//  - At 100-300ms: e2, e3, e4 are ignored (within 1000ms window)
//  - At 1000ms: e5 is emitted (1000ms has passed since e1)
//  - At 1100-1200ms: e6, e7 are ignored
//  - At 2000ms: e8 is emitted (1000ms has passed since e5)

const scroll$ = source<number>();

const throttled$ = scroll$.pipe(throttleTime(200));

const mut_history: number[] = [];

throttled$.subscribe((value) => {
  mut_history.push(value);
});

scroll$.next(1);

assert.deepStrictEqual(mut_history, [1]);

await new Promise((resolve) => {
  setTimeout(resolve, 50);
});

scroll$.next(2);

scroll$.next(3);

assert.deepStrictEqual(mut_history, [1]);

await new Promise((resolve) => {
  setTimeout(resolve, 200);
});

scroll$.next(4);

assert.deepStrictEqual(mut_history, [1, 4]);
```

***

### timer()

> `const` **timer**: (`milliSeconds`, `startManually?`) => `TimerObservable`

Defined in: synstate/dist/core/create/timer.d.mts:38

Creates an observable that emits 0 after a specified delay and then completes.

#### Parameters

##### milliSeconds

`number`

The delay in milliseconds before emission

##### startManually?

`boolean`

If true, waits for manual start (default: false)

#### Returns

`TimerObservable`

An observable that emits after delay

#### Example

```ts
//  Timeline:
//
//  Time(ms)  0     ...   1000
//  delayed$                X (emits and completes)
//
//  Explanation:
//  - timer emits once after the specified delay, then completes
//  - Useful for delayed actions or timeouts

const delayed$ = timer(100);

const mut_history: number[] = [];

await new Promise<void>((resolve) => {
  delayed$.subscribe(
    () => {
      mut_history.push(1);
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [1]);
```

***

### toSubscriber()

> `const` **toSubscriber**: \<`A`\>(`onNext`, `onComplete?`) => `Subscriber`\<`A`\>

Defined in: synstate/dist/core/utils/observable-utils.d.mts:2

#### Type Parameters

##### A

`A`

#### Parameters

##### onNext

(`v`) => `void`

##### onComplete?

() => `void`

#### Returns

`Subscriber`\<`A`\>

***

### unwrapOptional()

> `const` **unwrapOptional**: \<`O`\>() => `KeepInitialValueOperator`\<`O`, `Optional.Unwrap`\<`O`\> \| `undefined`\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:48

#### Type Parameters

##### O

`O` *extends* `UnknownOptional`

#### Returns

`KeepInitialValueOperator`\<`O`, `Optional.Unwrap`\<`O`\> \| `undefined`\>

***

### unwrapResultErr()

> `const` **unwrapResultErr**: \<`R`\>() => `KeepInitialValueOperator`\<`R`, `Result.UnwrapErr`\<`R`\> \| `undefined`\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:50

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

#### Returns

`KeepInitialValueOperator`\<`R`, `Result.UnwrapErr`\<`R`\> \| `undefined`\>

***

### unwrapResultOk()

> `const` **unwrapResultOk**: \<`R`\>() => `KeepInitialValueOperator`\<`R`, `Result.UnwrapOk`\<`R`\> \| `undefined`\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:49

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

#### Returns

`KeepInitialValueOperator`\<`R`, `Result.UnwrapOk`\<`R`\> \| `undefined`\>

***

### withBuffered()

> `const` **withBuffered**: \<`A`, `B`\>(`observable`) => `KeepInitialValueOperator`\<`A`, readonly \[`A`, readonly `B`[]\]\>

Defined in: synstate/dist/core/operators/with-buffered-from.d.mts:56

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### observable

`Observable`\<`B`\>

#### Returns

`KeepInitialValueOperator`\<`A`, readonly \[`A`, readonly `B`[]\]\>

***

### withBufferedFrom()

> `const` **withBufferedFrom**: \<`A`, `B`\>(`observable`) => `KeepInitialValueOperator`\<`A`, readonly \[`A`, readonly `B`[]\]\>

Defined in: synstate/dist/core/operators/with-buffered-from.d.mts:55

Buffers values from the source observable and emits them along with the parent value
when the parent emits. The buffer is cleared after each emission.

#### Type Parameters

##### A

`A`

The type of values from the parent observable

##### B

`B`

The type of values from the source observable

#### Parameters

##### observable

`Observable`\<`B`\>

The observable whose values will be buffered

#### Returns

`KeepInitialValueOperator`\<`A`, readonly \[`A`, readonly `B`[]\]\>

An operator that emits tuples of [parentValue, bufferedValues]

#### Example

```ts
//  Timeline:
//
//  data$       d1    d2    d3    d4    d5    d6    d7    d8
//  trigger$                T1                T2                T3
//  result$                 [T1,[d1,d2,d3]]   [T2,[d4,d5,d6]]   [T3,[d7,d8]]
//
//  Explanation:
//  - withBufferedFrom collects values from the source observable
//  - When the trigger emits, it emits a tuple of [triggerValue, bufferedValues]
//  - Buffer is cleared after each emission
//  - Useful for batching data collection triggered by events

const data$ = source<string>();

const trigger$ = source<number>();

const result$ = trigger$.pipe(withBufferedFrom(data$));

const mut_history: (readonly [number, readonly string[]])[] = [];

result$.subscribe(([triggerValue, bufferedData]) => {
  mut_history.push([triggerValue, bufferedData]);
});

data$.next('a');

data$.next('b');

trigger$.next(1);

assert.deepStrictEqual(mut_history, [[1, ['a', 'b']]]);

data$.next('c');

trigger$.next(2);

assert.deepStrictEqual(mut_history, [
  [1, ['a', 'b']],
  [2, ['c']],
]);
```

***

### withCurrentValueFrom()

> `const` **withCurrentValueFrom**: \<`A`, `B`\>(`observable`) => `DropInitialValueOperator`\<`A`, readonly \[`A`, `B`\]\>

Defined in: synstate/dist/core/operators/with-current-value-from.d.mts:57

Samples the current value from another observable each time the source emits.
Emits a tuple of [sourceValue, sampledValue].

#### Type Parameters

##### A

`A`

The type of values from the source observable

##### B

`B`

The type of values from the sampled observable

#### Parameters

##### observable

`Observable`\<`B`\>

The observable to sample from

#### Returns

`DropInitialValueOperator`\<`A`, readonly \[`A`, `B`\]\>

An operator that emits tuples of source and sampled values

#### Example

```ts
//  Timeline:
//
//  name$     "Alice"           "Bob"               "Charlie"
//  age$                25              30      35              40
//  result$             ["Alice",25]  ["Bob",30]  ["Bob",35]  ["Charlie",40]
//
//  Explanation:
//  - withCurrentValueFrom samples the current value from another observable
//  - Emits a tuple [sourceValue, sampledValue] each time the source emits
//  - Does not emit until both observables have emitted at least once
//  - Similar to combine, but only emits when the source (not the sampled) emits

const name$ = source<string>();

const age$ = source<number>();

const result$ = name$.pipe(withCurrentValueFrom(age$));

const mut_history: (readonly [string, number])[] = [];

result$.subscribe(([name_, currentAge]) => {
  mut_history.push([name_, currentAge]);
});

name$.next('Alice'); // nothing logged (age$ hasn't emitted)

assert.deepStrictEqual(mut_history, []);

age$.next(25);

name$.next('Bob'); // logs: Bob is 25 years old

assert.deepStrictEqual(mut_history, [['Bob', 25]]);

age$.next(30);

name$.next('Charlie'); // logs: Charlie is 30 years old

assert.deepStrictEqual(mut_history, [
  ['Bob', 25],
  ['Charlie', 30],
]);
```

***

### withIndex()

> `const` **withIndex**: \<`A`\>() => `KeepInitialValueOperator`\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

Defined in: synstate/dist/core/operators/map-with-index.d.mts:47

#### Type Parameters

##### A

`A`

#### Returns

`KeepInitialValueOperator`\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

***

### withInitialValue()

> `const` **withInitialValue**: \<`A`, `I`\>(`initialValue`) => `WithInitialValueOperator`\<`A`, `A` \| `I`\>

Defined in: synstate/dist/core/operators/with-initial-value.d.mts:47

Provides an initial value for an observable that doesn't have one.
The resulting observable will immediately emit the initial value upon subscription,
and then emit all subsequent values from the source.

#### Type Parameters

##### A

`A`

The type of values from the source

##### I

`I` = `A`

The type of the initial value (defaults to A)

#### Parameters

##### initialValue

`I`

The initial value to emit

#### Returns

`WithInitialValueOperator`\<`A`, `A` \| `I`\>

An operator that sets the initial value

#### Example

```ts
//  Timeline:
//
//  num$             1    2    3
//  withInitial$ 0   1    2    3
//               ^
//               initial value
//
//  Explanation:
//  - withInitialValue provides an initial value before the source emits
//  - Converts an uninitialized observable to an initialized one
//  - Useful when you need a default value immediately

const num$ = source<number>();

const initialized$ = num$.pipe(withInitialValue(0));

const mut_history: number[] = [];

initialized$.subscribe((x) => {
  mut_history.push(x);
});

assert.deepStrictEqual(mut_history, [0]);

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [0, 1]);

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [0, 1, 2]);
```

***

### withLatestFrom()

> `const` **withLatestFrom**: \<`A`, `B`\>(`observable`) => `DropInitialValueOperator`\<`A`, readonly \[`A`, `B`\]\>

Defined in: synstate/dist/core/operators/with-current-value-from.d.mts:58

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### observable

`Observable`\<`B`\>

#### Returns

`DropInitialValueOperator`\<`A`, readonly \[`A`, `B`\]\>

***

### zip()

> `const` **zip**: \<`OS`\>(`parents`) => `ZipObservableRefined`\<`OS`\>

Defined in: synstate/dist/core/combine/zip.d.mts:50

Combines multiple observables by pairing their emissions by index.
Waits for all sources to emit their nth value before emitting the nth tuple.
Completes when any source completes.

#### Type Parameters

##### OS

`OS` *extends* `NonEmptyArray`\<`Observable`\<`unknown`\>\>

Tuple type of source observables

#### Parameters

##### parents

`OS`

Array of observables to zip

#### Returns

`ZipObservableRefined`\<`OS`\>

A zipped observable emitting tuples of values

#### Example

```ts
//  Timeline:
//
//  letters$  'a'       'b'       'c'
//  numbers$  1         2         3
//  zipped$   ['a',1]   ['b',2]   ['c',3]
//
//  Explanation:
//  - zip pairs values by their index from multiple sources
//  - Waits for all sources to emit at the same index
//  - Completes when any source completes

const letters$ = fromArray(['a', 'b', 'c']);

const numbers$ = fromArray([1, 2, 3]);

const zipped$ = zip([letters$, numbers$]);

const mut_history: (readonly [string, number])[] = [];

await new Promise<void>((resolve) => {
  zipped$.subscribe(
    ([letter, num]) => {
      mut_history.push([letter, num]);
    },
    () => {
      resolve();
    },
  );
});

assert.deepStrictEqual(mut_history, [
  ['a', 1],
  ['b', 2],
  ['c', 3],
]);
```

## Functions

### filter()

#### Call Signature

> **filter**\<`A`, `B`\>(`predicate`): `DropInitialValueOperator`\<`A`, `B`\>

Defined in: synstate/dist/core/operators/filter.d.mts:51

Filters values emitted by the source observable based on a predicate function.
Only values that satisfy the predicate will be emitted by the resulting observable.

##### Type Parameters

###### A

`A`

The type of values from the source

###### B

`B`

The narrowed type when using type guard

##### Parameters

###### predicate

(`value`, `index`) => `value is B`

A function that tests each value (receives value and index)

##### Returns

`DropInitialValueOperator`\<`A`, `B`\>

An operator that filters the observable

##### Example

```ts
//  Timeline:
//
//  num$          1     2     3     4     5     6
//  even$               2           4           6
//
//  Explanation:
//  - filter passes through only values that satisfy the predicate
//  - Only even numbers (2, 4, 6) are emitted

const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

const mut_history: number[] = [];

even$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [2]);

num$.next(3); // nothing logged

num$.next(4); // logs: 4

assert.deepStrictEqual(mut_history, [2, 4]);

num$.next(5);

num$.next(6);

assert.deepStrictEqual(mut_history, [2, 4, 6]);
```

#### Call Signature

> **filter**\<`A`\>(`predicate`): `DropInitialValueOperator`\<`A`, `A`\>

Defined in: synstate/dist/core/operators/filter.d.mts:52

Filters values emitted by the source observable based on a predicate function.
Only values that satisfy the predicate will be emitted by the resulting observable.

##### Type Parameters

###### A

`A`

The type of values from the source

##### Parameters

###### predicate

(`value`, `index`) => `boolean`

A function that tests each value (receives value and index)

##### Returns

`DropInitialValueOperator`\<`A`, `A`\>

An operator that filters the observable

##### Example

```ts
//  Timeline:
//
//  num$          1     2     3     4     5     6
//  even$               2           4           6
//
//  Explanation:
//  - filter passes through only values that satisfy the predicate
//  - Only even numbers (2, 4, 6) are emitted

const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

const mut_history: number[] = [];

even$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [2]);

num$.next(3); // nothing logged

num$.next(4); // logs: 4

assert.deepStrictEqual(mut_history, [2, 4]);

num$.next(5);

num$.next(6);

assert.deepStrictEqual(mut_history, [2, 4, 6]);
```

***

### source()

#### Call Signature

> **source**\<`A`\>(`initialValue`): `InitializedSourceObservable`\<`A`\>

Defined in: synstate/dist/core/create/source.d.mts:41

Creates a new Observable source that can manually emit values.
This is the primary way to create root observables that start reactive chains.

##### Type Parameters

###### A

`A`

The type of values emitted by the source

##### Parameters

###### initialValue

`A`

##### Returns

`InitializedSourceObservable`\<`A`\>

A SourceObservable that can emit values via `.next()` method

##### Example

```ts
//  Timeline:
//
//  count$    1     2     3     ...
//
//  Explanation:
//  - source creates a new observable that you can manually emit values to
//  - Use .next() to emit values
//  - Foundation for building custom observables

const count$ = source<number>();

const mut_history: number[] = [];

count$.subscribe((value) => {
  mut_history.push(value);
});

count$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

count$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

count$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```

#### Call Signature

> **source**\<`A`\>(): `SourceObservable`\<`A`\>

Defined in: synstate/dist/core/create/source.d.mts:42

Creates a new Observable source that can manually emit values.
This is the primary way to create root observables that start reactive chains.

##### Type Parameters

###### A

`A`

The type of values emitted by the source

##### Returns

`SourceObservable`\<`A`\>

A SourceObservable that can emit values via `.next()` method

##### Example

```ts
//  Timeline:
//
//  count$    1     2     3     ...
//
//  Explanation:
//  - source creates a new observable that you can manually emit values to
//  - Use .next() to emit values
//  - Foundation for building custom observables

const count$ = source<number>();

const mut_history: number[] = [];

count$.subscribe((value) => {
  mut_history.push(value);
});

count$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

count$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

count$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```
