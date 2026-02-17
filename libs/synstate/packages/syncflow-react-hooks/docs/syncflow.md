[**syncflow-react-hooks**](README.md)

***

[syncflow-react-hooks](README.md) / syncflow

# syncflow

## Classes

### AsyncChildObservableClass

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:3

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:7

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`AsyncChildObservable.depth`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`depth`](#depth-3)

##### descendantsIdSet

> `protected` `readonly` **descendantsIdSet**: `MutableSet`\<`ObservableId`\>

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:6

##### id

> `readonly` **id**: `ObservableId`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`AsyncChildObservable.id`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`id`](#id-2)

##### kind

> `readonly` **kind**: `"async child"`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`AsyncChildObservable.kind`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`kind`](#kind-3)

##### parents

> `readonly` **parents**: `Readonly`\<`{ [P_1 in keyof P]: Observable<P[P_1]> }`\>

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:5

###### Implementation of

`AsyncChildObservable.parents`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasChild`](#haschild-2)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasSubscriber`](#hassubscriber-2)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`isCompleted`](#iscompleted-2)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`AsyncChildObservable.updaterSymbol`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`updaterSymbol`](#updatersymbol-2)

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:12

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:12

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:14

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.complete`

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`complete`](#complete-2)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getCurrentValue`](#getcurrentvalue-2)

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:13

###### Returns

`Optional`\<`A`\>

###### Implementation of

`AsyncChildObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getSnapshot`](#getsnapshot-2)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`AsyncChildObservable.hasActiveChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasActiveChild`](#hasactivechild-2)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:24

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:25

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:20

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:13

###### Parameters

###### nextValue

`A`

###### Returns

`void`

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): `Subscription`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:26

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:15

###### Returns

`void`

###### Implementation of

`AsyncChildObservable.tryComplete`

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`tryComplete`](#trycomplete-2)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:21

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:27

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:28

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`InitializedSyncChildObservable.depth`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`depth`](#depth-5)

##### id

> `readonly` **id**: `ObservableId`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`InitializedSyncChildObservable.id`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`id`](#id-4)

##### kind

> `readonly` **kind**: `"sync child"`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`InitializedSyncChildObservable.kind`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`kind`](#kind-5)

##### parents

> `readonly` **parents**: `Readonly`\<`{ [P_1 in keyof P]: Observable<P[P_1]> }`\>

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:18

###### Implementation of

`InitializedSyncChildObservable.parents`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`parents`](#parents-2)

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasChild`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasChild`](#haschild-4)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasSubscriber`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasSubscriber`](#hassubscriber-4)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.isCompleted`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`isCompleted`](#iscompleted-4)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`InitializedSyncChildObservable.updaterSymbol`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`updaterSymbol`](#updatersymbol-4)

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:12

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:24

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.complete`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`complete`](#complete-4)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`getCurrentValue`](#getcurrentvalue-4)

##### getSnapshot()

> **getSnapshot**(): `Some`\<`A`\>

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:33

###### Returns

`Some`\<`A`\>

###### Implementation of

`InitializedSyncChildObservable.getSnapshot`

###### Overrides

[`SyncChildObservableClass`](#syncchildobservableclass).[`getSnapshot`](#getsnapshot-4)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`InitializedSyncChildObservable.hasActiveChild`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`hasActiveChild`](#hasactivechild-4)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:34

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:35

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:20

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:26

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:25

###### Returns

`void`

###### Implementation of

`InitializedSyncChildObservable.tryComplete`

###### Inherited from

[`SyncChildObservableClass`](#syncchildobservableclass).[`tryComplete`](#trycomplete-4)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:21

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:2

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:7

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `depth`: `Depth`; `initialValue`: `ReturnType`\<`ObservableBase`\<`A`\>\[`"getSnapshot"`\]\>; `kind`: `Kind`; \}\>

###### Returns

[`ObservableBaseClass`](#observablebaseclass)\<`A`, `Kind`, `Depth`\>

#### Properties

##### depth

> `readonly` **depth**: `Depth`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`ObservableBase.depth`

##### id

> `readonly` **id**: `ObservableId`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`ObservableBase.id`

##### kind

> `readonly` **kind**: `Kind`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`ObservableBase.kind`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasChild`

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasSubscriber`

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`ObservableBase.isCompleted`

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`ObservableBase.updaterSymbol`

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:12

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:23

###### Returns

`void`

###### Implementation of

`ObservableBase.complete`

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:13

###### Returns

`Optional`\<`A`\>

###### Implementation of

`ObservableBase.getSnapshot`

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`ObservableBase.hasActiveChild`

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:24

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:25

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:20

###### Parameters

###### nextValue

`A`

###### updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): `Subscription`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:26

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:22

###### Returns

`void`

###### Implementation of

`ObservableBase.tryComplete`

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:21

###### Parameters

###### \_updaterSymbol

`UpdaterSymbol`

###### Returns

`void`

###### Implementation of

`ObservableBase.tryUpdate`

***

### RootObservableClass

Defined in: syncflow/dist/core/class/root-observable-class.d.mts:3

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

Defined in: syncflow/dist/core/class/root-observable-class.d.mts:6

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

Defined in: syncflow/dist/core/class/root-observable-class.d.mts:5

##### depth

> `readonly` **depth**: `0`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`RootObservable.depth`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`depth`](#depth-3)

##### id

> `readonly` **id**: `ObservableId`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`RootObservable.id`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`id`](#id-2)

##### kind

> `readonly` **kind**: `"root"`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`RootObservable.kind`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`kind`](#kind-3)

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasChild`](#haschild-2)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasSubscriber`](#hassubscriber-2)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`RootObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`isCompleted`](#iscompleted-2)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`RootObservable.updaterSymbol`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`updaterSymbol`](#updatersymbol-2)

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:12

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

Defined in: syncflow/dist/core/class/root-observable-class.d.mts:9

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:23

###### Returns

`void`

###### Implementation of

`RootObservable.complete`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`complete`](#complete-2)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getCurrentValue`](#getcurrentvalue-2)

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:13

###### Returns

`Optional`\<`A`\>

###### Implementation of

`RootObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getSnapshot`](#getsnapshot-2)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasActiveChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasActiveChild`](#hasactivechild-2)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:24

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:25

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:20

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

Defined in: syncflow/dist/core/class/root-observable-class.d.mts:10

###### Parameters

###### nextValue

`A`

###### Returns

`void`

##### subscribe()

> **subscribe**(`onNext`, `onComplete?`): `Subscription`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:26

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:22

###### Returns

`void`

###### Implementation of

`RootObservable.tryComplete`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`tryComplete`](#trycomplete-2)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:21

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:17

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:19

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:6

###### Implementation of

`SyncChildObservable.depth`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`depth`](#depth-3)

##### id

> `readonly` **id**: `ObservableId`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:4

###### Implementation of

`SyncChildObservable.id`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`id`](#id-2)

##### kind

> `readonly` **kind**: `"sync child"`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:5

###### Implementation of

`SyncChildObservable.kind`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`kind`](#kind-3)

##### parents

> `readonly` **parents**: `Readonly`\<`{ [P_1 in keyof P]: Observable<P[P_1]> }`\>

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:18

###### Implementation of

`SyncChildObservable.parents`

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:18

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasChild`](#haschild-2)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:17

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasSubscriber`](#hassubscriber-2)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:15

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`isCompleted`](#iscompleted-2)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): `UpdaterSymbol`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:16

###### Returns

`UpdaterSymbol`

###### Implementation of

`SyncChildObservable.updaterSymbol`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`updaterSymbol`](#updatersymbol-2)

#### Methods

##### addChild()

> **addChild**\<`B`\>(`child`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:12

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:24

###### Returns

`void`

###### Implementation of

`SyncChildObservable.complete`

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`complete`](#complete-2)

##### getCurrentValue()

> `protected` **getCurrentValue**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:14

###### Returns

`Optional`\<`A`\>

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getCurrentValue`](#getcurrentvalue-2)

##### getSnapshot()

> **getSnapshot**(): `Optional`\<`A`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:13

###### Returns

`Optional`\<`A`\>

###### Implementation of

`SyncChildObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`getSnapshot`](#getsnapshot-2)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:19

###### Returns

`boolean`

###### Implementation of

`SyncChildObservable.hasActiveChild`

###### Inherited from

[`ObservableBaseClass`](#observablebaseclass).[`hasActiveChild`](#hasactivechild-2)

##### pipe()

###### Call Signature

> **pipe**\<`B`\>(`operator`): `InitializedObservable`\<`B`\>

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:24

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:25

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:20

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

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:26

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

Defined in: syncflow/dist/core/class/child-observable-class.d.mts:25

###### Returns

`void`

###### Implementation of

`SyncChildObservable.tryComplete`

###### Overrides

[`ObservableBaseClass`](#observablebaseclass).[`tryComplete`](#trycomplete-2)

##### tryUpdate()

> **tryUpdate**(`_updaterSymbol`): `void`

Defined in: syncflow/dist/core/class/observable-base-class.d.mts:21

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

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:31

#### Type Parameters

##### A

`A`

#### Returns

`KeepInitialValueOperator`\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

***

### auditTime()

> `const` **auditTime**: \<`A`\>(`milliSeconds`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/audit-time.d.mts:2

#### Type Parameters

##### A

`A`

#### Parameters

##### milliSeconds

`number`

#### Returns

`KeepInitialValueOperator`\<`A`, `A`\>

***

### binarySearch()

> `const` **binarySearch**: \<`N`\>(`sortedArray`, `x`) => `NegativeInt32` \| `Uint32`

Defined in: syncflow/dist/core/utils/utils.d.mts:3

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

Defined in: syncflow/dist/core/combine/combine.d.mts:29

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
const name$ = source<string>();

const age$ = source<number>();

const user$ = combine([name$, age$]);

user$.subscribe(([name_, age]) => {
  console.log({ name: name_, age });
});

name$.next('Alice');

age$.next(25); // logs: { name: 'Alice', age: 25 }

name$.next('Bob'); // logs: { name: 'Bob', age: 25 }
```

***

### combineLatest()

> `const` **combineLatest**: \<`OS`\>(`parents`) => `CombineObservableRefined`\<`OS`\>

Defined in: syncflow/dist/core/combine/combine.d.mts:34

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

Defined in: syncflow/dist/utils/create-event-emitter.d.mts:19

Creates an event emitter for void events (events without payload).
Returns a tuple of [observable, emitter function].

#### Returns

readonly \[`Observable`\<`void`\>, () => `void`\]

A tuple containing the observable and the emitter function

#### Example

```ts
const [click$, emitClick] = createEventEmitter();

click$.subscribe(() => {
  console.log('Clicked!');
});

emitClick(); // logs: Clicked!
```

***

### createValueEmitter()

> `const` **createValueEmitter**: \<`A`\>() => readonly \[`Observable`\<`A`\>, (`value`) => `void`\]

Defined in: syncflow/dist/utils/create-event-emitter.d.mts:38

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

message$.subscribe((msg) => {
  console.log(msg);
});

emitMessage('Hello'); // logs: Hello
```

***

### debounceTime()

> `const` **debounceTime**: \<`A`\>(`milliSeconds`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/debounce-time.d.mts:30

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
const input$ = source<string>();

const debounced$ = input$.pipe(debounceTime(300));

debounced$.subscribe((value) => {
  console.log(value);
});

input$.next('h');

input$.next('he');

input$.next('hel');

input$.next('hello');
// After 300ms of silence, logs: hello
```

***

### distinctUntilChanged()

> `const` **distinctUntilChanged**: \<`A`\>(`eq?`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/skip-if-no-change.d.mts:32

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

Defined in: syncflow/dist/core/operators/merge-map.d.mts:33

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

Defined in: syncflow/dist/core/create/from-array.d.mts:20

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
const nums$ = fromArray([1, 2, 3]);

nums$.subscribe((x) => {
  console.log(x);
});
// logs: 1, 2, 3
```

***

### fromPromise()

> `const` **fromPromise**: \<`A`, `E`\>(`promise`) => `FromPromiseObservable`\<`A`, `E`\>

Defined in: syncflow/dist/core/create/from-promise.d.mts:24

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
const data$ = fromPromise(fetch('/api/data').then((r) => r.json()));

data$.subscribe((result) => {
  if (Result.isOk(result)) {
    console.log('Data:', result.value);
  } else {
    console.error('Error:', result.value);
  }
});
```

***

### fromSubscribable()

> `const` **fromSubscribable**: \<`A`, `E`\>(`subscribable`) => `FromSubscribableObservable`\<`A`, `E`\>

Defined in: syncflow/dist/core/create/from-subscribable.d.mts:2

#### Type Parameters

##### A

`A`

##### E

`E` = `unknown`

#### Parameters

##### subscribable

`Subscribable`\<`A`\>

#### Returns

`FromSubscribableObservable`\<`A`, `E`\>

***

### getKey()

> `const` **getKey**: \<`A`, `K`\>(`key`) => `KeepInitialValueOperator`\<`A`, `A`\[`K`\]\>

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:30

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

Defined in: syncflow/dist/core/utils/utils.d.mts:1

#### Parameters

##### x

`SafeInt`

#### Returns

`SafeInt`

***

### interval()

> `const` **interval**: (`milliSeconds`, `startManually?`) => `IntervalObservable`

Defined in: syncflow/dist/core/create/interval.d.mts:20

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
const tick$ = interval(1000);

tick$.subscribe((count) => {
  console.log(count);
});
// logs: 0, 1, 2, 3, ... every second
```

***

### isChildObservable()

> `const` **isChildObservable**: \<`A`\>(`obs`) => `obs is ChildObservable<A>`

Defined in: syncflow/dist/core/types/observable.d.mts:71

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

Defined in: syncflow/dist/core/types/observable.d.mts:69

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

Defined in: syncflow/dist/core/types/observable.d.mts:70

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

Defined in: syncflow/dist/core/utils/id-maker.d.mts:2

#### Returns

`ObservableId`

***

### issueSubscriberId()

> `const` **issueSubscriberId**: () => `SubscriberId`

Defined in: syncflow/dist/core/utils/id-maker.d.mts:3

#### Returns

`SubscriberId`

***

### issueUpdaterSymbol()

> `const` **issueUpdaterSymbol**: () => `UpdaterSymbol`

Defined in: syncflow/dist/core/utils/id-maker.d.mts:4

#### Returns

`UpdaterSymbol`

***

### map()

> `const` **map**: \<`A`, `B`\>(`mapFn`) => `KeepInitialValueOperator`\<`A`, `B`\>

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:27

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

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:36

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

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:38

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

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:37

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

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:28

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

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:26

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
const num$ = source<number>();

const indexed$ = num$.pipe(mapWithIndex((x, i) => `${i}: ${x}`));

indexed$.subscribe((s) => {
  console.log(s);
});

num$.next(10); // logs: 0: 10

num$.next(20); // logs: 1: 20
```

***

### maxDepth()

> `const` **maxDepth**: (`parents`) => `number`

Defined in: syncflow/dist/core/utils/max-depth.d.mts:2

#### Parameters

##### parents

readonly `Observable`\<`unknown`\>[]

#### Returns

`number`

***

### merge()

> `const` **merge**: \<`OS`\>(`parents`) => `MergeObservableRefined`\<`OS`\>

Defined in: syncflow/dist/core/combine/merge.d.mts:27

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
const clicks$ = source<MouseEvent>();

const keys$ = source<KeyboardEvent>();

const events$ = merge([clicks$, keys$]);

events$.subscribe((event_) => {
  console.log(event_);
});
// Logs any mouse click or keyboard event
```

#### Note

To improve code readability, consider using `createState` instead of `merge`,
subscribing to `parents` and calling `setState` within it.

***

### mergeMap()

> `const` **mergeMap**: \<`A`, `B`\>(`mapToObservable`) => `DropInitialValueOperator`\<`A`, `B`\>

Defined in: syncflow/dist/core/operators/merge-map.d.mts:28

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
const ids$ = source<number>();

const users$ = ids$.pipe(mergeMap((id) => fromPromise(fetchUser(id))));

users$.subscribe((user) => {
  console.log(user);
});
// All requests run in parallel, results merged as they arrive

const fetchUser = async (id: number): Promise<unknown> => ({ id });
```

#### Note

To improve code readability, consider using `createState` instead of `mergeMap`,
subscribing to `parentObservable` and calling `setState` within it.

***

### of()

> `const` **of**: \<`A`\>(`value`, `startManually?`) => `OfObservable`\<`A`\>

Defined in: syncflow/dist/core/create/of.d.mts:19

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
const num$ = of(42);

num$.subscribe((x) => {
  console.log(x);
}); // logs: 42
```

***

### pairwise()

> `const` **pairwise**: \<`A`\>() => `DropInitialValueOperator`\<`A`, readonly \[`A`, `A`\]\>

Defined in: syncflow/dist/core/operators/pairwise.d.mts:26

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
const num$ = source<number>();

const pairs$ = num$.pipe(pairwise());

pairs$.subscribe(([prev, curr]) => {
  console.log(prev, curr);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 1, 2

num$.next(3); // logs: 2, 3
```

***

### pluck()

> `const` **pluck**: \<`A`, `K`\>(`key`) => `KeepInitialValueOperator`\<`A`, `A`\[`K`\]\>

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:29

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

Defined in: syncflow/dist/core/operators/scan.d.mts:29

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
const num$ = source<number>();

const sum$ = num$.pipe(scan((acc, curr) => acc + curr, 0));

sum$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(2); // logs: 3

num$.next(3); // logs: 6
```

***

### skip()

> `const` **skip**: \<`A`\>(`n`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/skip-while.d.mts:3

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

Defined in: syncflow/dist/core/operators/skip-if-no-change.d.mts:27

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
const num$ = source<number>();

const distinct$ = num$.pipe(skipIfNoChange());

distinct$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(1); // nothing logged

num$.next(2); // logs: 2
```

***

### skipUntil()

> `const` **skipUntil**: \<`A`\>(`notifier`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/skip-until.d.mts:2

#### Type Parameters

##### A

`A`

#### Parameters

##### notifier

`Observable`\<`unknown`\>

#### Returns

`DropInitialValueOperator`\<`A`, `A`\>

***

### skipWhile()

> `const` **skipWhile**: \<`A`\>(`predicate`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/skip-while.d.mts:2

#### Type Parameters

##### A

`A`

#### Parameters

##### predicate

(`value`, `index`) => `boolean`

#### Returns

`DropInitialValueOperator`\<`A`, `A`\>

***

### subject

> `const` **subject**: *typeof* [`source`](#source)

Defined in: syncflow/dist/core/create/source.d.mts:28

Alias for `source()`. Creates a new Observable source.

#### See

source

***

### switchMap()

> `const` **switchMap**: \<`A`, `B`\>(`mapToObservable`) => `DropInitialValueOperator`\<`A`, `B`\>

Defined in: syncflow/dist/core/operators/switch-map.d.mts:30

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
const searchQuery$ = source<string>();

const results$ = searchQuery$.pipe(
  switchMap((query) => fromPromise(fetchResults(query))),
);

results$.subscribe((results) => {
  console.log(results);
});
// Only the latest search results are emitted, previous searches are cancelled

const fetchResults = async (_query: string): Promise<readonly unknown[]> => [];
```

#### Note

To improve code readability, consider using `createState` instead of `switchMap`,
subscribe to `parentObservable` and call `setState` within it.

***

### take()

> `const` **take**: \<`A`\>(`n`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/take-while.d.mts:3

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

Defined in: syncflow/dist/core/operators/take-until.d.mts:31

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
const num$ = source<number>();

const [stopNotifier, stop_] = createEventEmitter();

const limited$ = num$.pipe(takeUntil(stopNotifier));

limited$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(2); // logs: 2

stop_();

num$.next(3); // nothing logged (completed)
```

***

### takeWhile()

> `const` **takeWhile**: \<`A`\>(`predicate`) => `DropInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/take-while.d.mts:2

#### Type Parameters

##### A

`A`

#### Parameters

##### predicate

(`value`, `index`) => `boolean`

#### Returns

`DropInitialValueOperator`\<`A`, `A`\>

***

### throttleTime()

> `const` **throttleTime**: \<`A`\>(`milliSeconds`) => `KeepInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/throttle-time.d.mts:22

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
const scroll$ = source<Event>();

const throttled$ = scroll$.pipe(throttleTime(1000));

throttled$.subscribe((event_) => {
  console.log(event_);
});
// Emits at most once per second
```

***

### timer()

> `const` **timer**: (`milliSeconds`, `startManually?`) => `TimerObservable`

Defined in: syncflow/dist/core/create/timer.d.mts:19

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
const delayed$ = timer(1000);

delayed$.subscribe(() => {
  console.log('1 second passed');
});
// After 1 second, logs: 1 second passed
```

***

### toSubscriber()

> `const` **toSubscriber**: \<`A`\>(`onNext`, `onComplete?`) => `Subscriber`\<`A`\>

Defined in: syncflow/dist/core/utils/observable-utils.d.mts:2

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

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:33

#### Type Parameters

##### O

`O` *extends* `UnknownOptional`

#### Returns

`KeepInitialValueOperator`\<`O`, `Optional.Unwrap`\<`O`\> \| `undefined`\>

***

### unwrapResultErr()

> `const` **unwrapResultErr**: \<`R`\>() => `KeepInitialValueOperator`\<`R`, `Result.UnwrapErr`\<`R`\> \| `undefined`\>

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:35

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

#### Returns

`KeepInitialValueOperator`\<`R`, `Result.UnwrapErr`\<`R`\> \| `undefined`\>

***

### unwrapResultOk()

> `const` **unwrapResultOk**: \<`R`\>() => `KeepInitialValueOperator`\<`R`, `Result.UnwrapOk`\<`R`\> \| `undefined`\>

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:34

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

#### Returns

`KeepInitialValueOperator`\<`R`, `Result.UnwrapOk`\<`R`\> \| `undefined`\>

***

### withBuffered()

> `const` **withBuffered**: \<`A`, `B`\>(`observable`) => `KeepInitialValueOperator`\<`A`, readonly \[`A`, readonly `B`[]\]\>

Defined in: syncflow/dist/core/operators/with-buffered-from.d.mts:3

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

Defined in: syncflow/dist/core/operators/with-buffered-from.d.mts:2

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

### withCurrentValueFrom()

> `const` **withCurrentValueFrom**: \<`A`, `B`\>(`observable`) => `DropInitialValueOperator`\<`A`, readonly \[`A`, `B`\]\>

Defined in: syncflow/dist/core/operators/with-current-value-from.d.mts:2

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

### withIndex()

> `const` **withIndex**: \<`A`\>() => `KeepInitialValueOperator`\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

Defined in: syncflow/dist/core/operators/map-with-index.d.mts:32

#### Type Parameters

##### A

`A`

#### Returns

`KeepInitialValueOperator`\<`A`, readonly \[`SafeUint` \| `-1`, `A`\]\>

***

### withInitialValue()

> `const` **withInitialValue**: \<`A`, `I`\>(`initialValue`) => `WithInitialValueOperator`\<`A`, `A` \| `I`\>

Defined in: syncflow/dist/core/operators/with-initial-value.d.mts:25

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
const num$ = source<number>();

const initialized$ = num$.pipe(withInitialValue(0));

initialized$.subscribe((x) => {
  console.log(x);
}); // immediately logs: 0

num$.next(1); // logs: 1
```

***

### withLatestFrom()

> `const` **withLatestFrom**: \<`A`, `B`\>(`observable`) => `DropInitialValueOperator`\<`A`, readonly \[`A`, `B`\]\>

Defined in: syncflow/dist/core/operators/with-current-value-from.d.mts:3

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

Defined in: syncflow/dist/core/combine/zip.d.mts:25

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
const letters$ = fromArray(['a', 'b', 'c']);

const numbers$ = fromArray([1, 2, 3]);

const zipped$ = zip([letters$, numbers$]);

zipped$.subscribe(([letter, num]) => {
  console.log(letter, num);
});
// logs: a 1, b 2, c 3
```

## Functions

### filter()

#### Call Signature

> **filter**\<`A`, `B`\>(`predicate`): `DropInitialValueOperator`\<`A`, `B`\>

Defined in: syncflow/dist/core/operators/filter.d.mts:26

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
const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

even$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2
```

#### Call Signature

> **filter**\<`A`\>(`predicate`): `DropInitialValueOperator`\<`A`, `A`\>

Defined in: syncflow/dist/core/operators/filter.d.mts:27

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
const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

even$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2
```

***

### source()

#### Call Signature

> **source**\<`A`\>(`initialValue`): `InitializedSourceObservable`\<`A`\>

Defined in: syncflow/dist/core/create/source.d.mts:22

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
const count$ = source<number>();

count$.subscribe((value) => {
  console.log(value);
});

count$.next(1); // logs: 1

count$.next(2); // logs: 2
```

#### Call Signature

> **source**\<`A`\>(): `SourceObservable`\<`A`\>

Defined in: syncflow/dist/core/create/source.d.mts:23

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
const count$ = source<number>();

count$.subscribe((value) => {
  console.log(value);
});

count$.next(1); // logs: 1

count$.next(2); // logs: 2
```
