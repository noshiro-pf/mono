[**synstate**](../README.md)

***

[synstate](../README.md) / utils/create-event-emitter

# utils/create-event-emitter

## Functions

### createEventEmitter()

> **createEventEmitter**(): readonly \[[`Observable`](../core/types/observable.md#observable)\<`void`\>, () => `void`\]

Defined in: [utils/create-event-emitter.mts:20](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/utils/create-event-emitter.mts#L20)

Creates an event emitter for void events (events without payload).
Returns a tuple of [observable, emitter function].

#### Returns

readonly \[[`Observable`](../core/types/observable.md#observable)\<`void`\>, () => `void`\]

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

> **createValueEmitter**\<`A`\>(): readonly \[[`Observable`](../core/types/observable.md#observable)\<`A`\>, (`value`) => `void`\]

Defined in: [utils/create-event-emitter.mts:51](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/utils/create-event-emitter.mts#L51)

Creates an event emitter with typed payload.
Returns a tuple of [observable, emitter function].

#### Type Parameters

##### A

`A`

The type of the event payload

#### Returns

readonly \[[`Observable`](../core/types/observable.md#observable)\<`A`\>, (`value`) => `void`\]

A tuple containing the observable and the emitter function

#### Example

```ts
const [message$, emitMessage] = createValueEmitter<string>();

message$.subscribe((msg) => {
  console.log(msg);
});

emitMessage('Hello'); // logs: Hello
```
