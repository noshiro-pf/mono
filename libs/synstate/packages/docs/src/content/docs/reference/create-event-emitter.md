---
prev: false
next: false
title: createEventEmitter
---

<!-- jsdoc-description -->

Creates an event emitter for void events (events without payload).
Returns a tuple of [observable, emitter function].

<!-- /jsdoc-description -->

## Example

```tsx
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
