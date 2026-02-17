[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/class/root-observable-class

# core/class/root-observable-class

## Classes

### RootObservableClass

Defined in: [core/class/root-observable-class.mts:11](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/root-observable-class.mts#L11)

#### Extends

- [`ObservableBaseClass`](observable-base-class.md#observablebaseclass)\<`A`, `"root"`, `0`\>

#### Type Parameters

##### A

`A`

#### Implements

- [`RootObservable`](../types/observable.md#rootobservable)\<`A`\>

#### Constructors

##### Constructor

> **new RootObservableClass**\<`A`\>(`__namedParameters`): [`RootObservableClass`](#rootobservableclass)\<`A`\>

Defined in: [core/class/root-observable-class.mts:18](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/root-observable-class.mts#L18)

###### Parameters

###### \_\_namedParameters

`Readonly`\<\{ `initialValue`: `ReturnType`\<[`RootObservable`](../types/observable.md#rootobservable)\<`A`\>\[`"getSnapshot"`\]\>; \}\>

###### Returns

[`RootObservableClass`](#rootobservableclass)\<`A`\>

###### Overrides

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`constructor`](observable-base-class.md#constructor)

#### Properties

##### \_descendantsIdSet

> `protected` `readonly` **\_descendantsIdSet**: `MutableSet`\<[`ObservableId`](../types/id.md#observableid)\>

Defined in: [core/class/root-observable-class.mts:16](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/root-observable-class.mts#L16)

##### depth

> `readonly` **depth**: `0`

Defined in: [core/class/observable-base-class.mts:28](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L28)

###### Implementation of

`RootObservable.depth`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`depth`](observable-base-class.md#depth-1)

##### id

> `readonly` **id**: [`ObservableId`](../types/id.md#observableid)

Defined in: [core/class/observable-base-class.mts:26](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L26)

###### Implementation of

`RootObservable.id`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`id`](observable-base-class.md#id)

##### kind

> `readonly` **kind**: `"root"`

Defined in: [core/class/observable-base-class.mts:27](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L27)

###### Implementation of

`RootObservable.kind`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`kind`](observable-base-class.md#kind-1)

#### Accessors

##### hasChild

###### Get Signature

> **get** **hasChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:89](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L89)

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasChild`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`hasChild`](observable-base-class.md#haschild)

##### hasSubscriber

###### Get Signature

> **get** **hasSubscriber**(): `boolean`

Defined in: [core/class/observable-base-class.mts:85](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L85)

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasSubscriber`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`hasSubscriber`](observable-base-class.md#hassubscriber)

##### isCompleted

###### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: [core/class/observable-base-class.mts:77](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L77)

###### Returns

`boolean`

###### Implementation of

`RootObservable.isCompleted`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`isCompleted`](observable-base-class.md#iscompleted)

##### updaterSymbol

###### Get Signature

> **get** **updaterSymbol**(): [`UpdaterSymbol`](../types/id.md#updatersymbol)

Defined in: [core/class/observable-base-class.mts:81](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L81)

###### Returns

[`UpdaterSymbol`](../types/id.md#updatersymbol)

###### Implementation of

`RootObservable.updaterSymbol`

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

`RootObservable.addChild`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`addChild`](observable-base-class.md#addchild)

##### addDescendant()

> **addDescendant**\<`B`\>(`child`): `void`

Defined in: [core/class/root-observable-class.mts:34](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/root-observable-class.mts#L34)

###### Type Parameters

###### B

`B`

###### Parameters

###### child

[`ChildObservable`](../types/observable.md#childobservable)\<`B`\>

###### Returns

`void`

###### Implementation of

`RootObservable.addDescendant`

##### complete()

> **complete**(): `void`

Defined in: [core/class/observable-base-class.mts:118](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L118)

###### Returns

`void`

###### Implementation of

`RootObservable.complete`

###### Inherited from

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

`RootObservable.getSnapshot`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`getSnapshot`](observable-base-class.md#getsnapshot)

##### hasActiveChild()

> **hasActiveChild**(): `boolean`

Defined in: [core/class/observable-base-class.mts:93](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L93)

###### Returns

`boolean`

###### Implementation of

`RootObservable.hasActiveChild`

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

`RootObservable.pipe`

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

`RootObservable.pipe`

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

Defined in: [core/class/root-observable-class.mts:47](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/root-observable-class.mts#L47)

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

`RootObservable.subscribe`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`subscribe`](observable-base-class.md#subscribe)

##### tryComplete()

> **tryComplete**(): `void`

Defined in: [core/class/observable-base-class.mts:112](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/class/observable-base-class.mts#L112)

###### Returns

`void`

###### Implementation of

`RootObservable.tryComplete`

###### Inherited from

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

`RootObservable.tryUpdate`

###### Inherited from

[`ObservableBaseClass`](observable-base-class.md#observablebaseclass).[`tryUpdate`](observable-base-class.md#tryupdate)
