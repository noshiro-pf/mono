---
prev: false
next: false
title: createValueEmitter
---

<!-- jsdoc-description -->

Creates an event emitter with typed payload.
Returns a tuple of [observable, emitter function].

<!-- /jsdoc-description -->

## Example

```tsx
const [message$, emitMessage] = createValueEmitter<string>();

const messageHistory: string[] = [];

message$.subscribe((msg) => {
    messageHistory.push(msg);
});

emitMessage('Hello'); // logs: Hello

assert.deepStrictEqual(messageHistory, ['Hello']);

emitMessage('World');

assert.deepStrictEqual(messageHistory, ['Hello', 'World']);
```
