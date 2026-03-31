---
prev: false
next: false
title: createReducer
---

<!-- jsdoc-description -->

Creates a reducer-based state management container following the Redux pattern.
Actions are dispatched to update the state according to the reducer function.

<!-- /jsdoc-description -->

## Example

```tsx
const [state, dispatch] = createReducer(
    (s, action: Readonly<{ type: 'increment' } | { type: 'decrement' }>) => {
        switch (action.type) {
            case 'increment':
                return s + 1;
            case 'decrement':
                return s - 1;
        }
    },
    0,
);

const stateHistory: number[] = [];

state.subscribe((value: number) => {
    stateHistory.push(value);
});

assert.deepStrictEqual(stateHistory, [0]);

dispatch({ type: 'increment' }); // logs: 1

assert.deepStrictEqual(stateHistory, [0, 1]);

dispatch({ type: 'increment' });

dispatch({ type: 'decrement' });

assert.deepStrictEqual(stateHistory, [0, 1, 2, 1]);
```
