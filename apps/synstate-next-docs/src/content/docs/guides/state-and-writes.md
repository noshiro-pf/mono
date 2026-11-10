---
title: State and writes
description: createState and its options, what happens to a write made during an update, batch, createReducer, createBooleanState and the event emitters.
---

## `createState` and its third element

`createState(initialState)` returns a tuple: the state, its setter, and an object with the rest. The tuple lets you hand the state to the code that reads it and the setter to the code that writes it.

```tsx
import { createState } from 'synstate-next';

const [count, setCount, { updateState, resetState, getSnapshot }] =
    createState(0);

const mut_seen: number[] = [];

count.subscribe((value) => {
    mut_seen.push(value);
});

setCount(10);

updateState((n) => n + 1);

// An equal value passes nothing on.
setCount(11);

assert.strictEqual(getSnapshot(), 11);

resetState();

assert.deepStrictEqual(mut_seen, [0, 10, 11, 0]);
```

| Element        | What it is                                                     |
| :------------- | :------------------------------------------------------------- |
| `state`        | An `InitializedObservable<S>`: `.value`, `subscribe`, `pipe`   |
| `setState`     | Writes a value; one equal to the current one passes nothing on |
| `updateState`  | Writes `fn(current)`                                           |
| `resetState`   | Writes the initial state again                                 |
| `getSnapshot`  | Reads the current value                                        |
| `initialState` | The value it started from                                      |

The setters return nothing. A write made inside an operator such as `map` or `derive`, while an update is recomputing values, is applied once the subscribers and bindings of the update under way have run (see below), so the value it would return is not known yet; read it with `getSnapshot` or `.value` when you need it.

`state(initialValue)` is the same state as an object, with `.value`, `.set` and `.update`, for code that keeps them together.

`.set` and `.update`, like `.emit` of a `source()`, are methods: call them on their object. To hand one to code that calls it on its own, wrap it, `(value) => { count.set(value); }`, or take the functions of `createState`, `createValueEmitter` and the other helpers, which can be passed as they are. TypeScript rejects a method taken off its object (`const { set } = count`), and one passed to `subscribe`, `onCleanup` or an event handler of synstate-dom-next.

## Deciding what counts as a change

A state passes a write on only when it changes the value, by `Object.is`. Two options change what "changes" means:

- `equals: (current, next) => boolean` replaces the comparison.
- `keepEqualParts: true` replaces every part of the written value that is deeply equal to the same part of the current one with the current one's. A value written whole from a source that answers with a new object each time keeps the identity of what did not change, so a `map` that reads an unchanged part passes nothing on, and a deeply equal value passes nothing on at all.

```tsx
import { createState, map } from 'synstate-next';

type User = Readonly<{
    name: string;
    tags: readonly string[];
}>;

// A server answers with a new object every time, equal or not.
const [user, setUser] = createState<User>(
    { name: 'Ada', tags: ['admin'] },
    { keepEqualParts: true },
);

const tags = user.pipe(map((u) => u.tags));

const mut_tagUpdates: (readonly string[])[] = [];

tags.subscribe((t) => {
    mut_tagUpdates.push(t);
});

const before = user.value;

// Deeply equal: nothing is passed on, and the object held stays.
setUser({ name: 'Ada', tags: ['admin'] });

assert.strictEqual(user.value, before);

// Only `name` changed: `tags` keeps its array, so `tags` passes nothing.
setUser({ name: 'Ada Lovelace', tags: ['admin'] });

assert.strictEqual(user.value.tags, before.tags);

assert.strictEqual(mut_tagUpdates.length, 1);

// `equals` decides what counts as a change.
const [point, setPoint] = createState(
    { x: 0, y: 0 },
    {
        equals: (current, next) => current.x === next.x && current.y === next.y,
    },
);

const mut_points: number[] = [];

point.subscribe((p) => {
    mut_points.push(p.x);
});

setPoint({ x: 0, y: 0 });

setPoint({ x: 1, y: 0 });

assert.deepStrictEqual(mut_points, [0, 1]);
```

## Writes during an update

An update runs in two steps. First every derived value the update reaches is recomputed, shallowest first. Then the subscribers, and the bindings of synstate-dom-next, run, once every value is up to date. Two rules follow, and neither needs remembering in practice because each is what the update would need anyway:

- **A write made inside an operator such as `map` or `derive`, while an update is recomputing values, waits for the update to end.** A `map` that writes to a state does not interrupt the update under way; the write is applied, in order, once the update's subscribers and bindings have run, and starts the next update. `update(fn)` defers `fn` itself, so two `update` calls made inside one update both apply.
- **A write made by a subscriber or a binding starts the next update.** Updates never nest.

Either way, a program that keeps writing to what its own update reaches, from subscribers or from operators, is stopped after 100 updates in a row, with an error that names the cause, instead of looping forever.

A write from a subscriber therefore works, but it is a second update: what reads both values sees the first one done and the second one not yet. Derive the value instead, and it is part of the same update:

```tsx
import { createState, derive, map } from 'synstate-next';

// Kept in step by a subscriber (avoid this):
const [celsius, setCelsius] = createState(0);

const [fahrenheit, setFahrenheit] = createState(32);

celsius.subscribe((c) => {
    setFahrenheit((c * 9) / 5 + 32);
});

const label = derive([celsius, fahrenheit], (c, f) => `${c}°C = ${f}°F`);

const mut_labels: string[] = [];

label.subscribe((text) => {
    mut_labels.push(text);
});

setCelsius(100);

// The subscriber's write is an update of its own, so `label` showed the
// update half done.
assert.deepStrictEqual(mut_labels, [
    '0°C = 32°F',
    '100°C = 32°F',
    '100°C = 212°F',
]);

// Derived instead: one update, nothing half done.
const [celsius2, setCelsius2] = createState(0);

const fahrenheit2 = celsius2.pipe(map((c) => (c * 9) / 5 + 32));

const label2 = derive([celsius2, fahrenheit2], (c, f) => `${c}°C = ${f}°F`);

const mut_labels2: string[] = [];

label2.subscribe((text) => {
    mut_labels2.push(text);
});

setCelsius2(100);

assert.deepStrictEqual(mut_labels2, ['0°C = 32°F', '100°C = 212°F']);
```

## `batch`

Each write outside an update is an update of its own. `batch(fn)` makes the writes inside `fn` one update, so what depends on several of them is computed once, from all of them:

```tsx
import { batch, createState, derive } from 'synstate-next';

const [first, setFirst] = createState('Ada');

const [last, setLast] = createState('Lovelace');

const fullName = derive([first, last], (f, l) => `${f} ${l}`);

const mut_seen: string[] = [];

fullName.subscribe((name) => {
    mut_seen.push(name);
});

// Two writes, two updates.
setFirst('Grace');

setLast('Hopper');

// Two writes, one update.
batch(() => {
    setFirst('Alan');

    setLast('Turing');
});

assert.deepStrictEqual(mut_seen, [
    'Ada Lovelace',
    'Grace Lovelace',
    'Grace Hopper',
    'Alan Turing',
]);
```

A state written twice in a batch propagates once, with the last value.

## `createReducer`

A state written only through a reducer. `dispatch` returns nothing; a dispatch made inside an operator such as `map` or `derive`, while an update is recomputing values, waits with the other writes until the update's subscribers and bindings have run, and then reduces the state the writes before it left.

```tsx
import { createReducer } from 'synstate-next';

type Action = Readonly<
    | { type: 'increment' }
    | { type: 'decrement' }
    | { type: 'set'; value: number }
>;

const reducer = (current: number, action: Action): number => {
    switch (action.type) {
        case 'increment':
            return current + 1;

        case 'decrement':
            return current - 1;

        case 'set':
            return action.value;
    }
};

const [count, dispatch, { getSnapshot }] = createReducer(reducer, 0);

const mut_seen: number[] = [];

count.subscribe((value) => {
    mut_seen.push(value);
});

dispatch({ type: 'increment' });

dispatch({ type: 'increment' });

dispatch({ type: 'set', value: 10 });

dispatch({ type: 'decrement' });

assert.strictEqual(getSnapshot(), 9);

assert.deepStrictEqual(mut_seen, [0, 1, 2, 10, 9]);
```

## `createBooleanState`

A boolean state with `setTrue`, `setFalse` and `toggle`, beside the setters of `createState`:

```tsx
import { createBooleanState } from 'synstate-next';

const [isOpen, { setTrue: open, setFalse: close, toggle }] =
    createBooleanState(false);

const mut_seen: boolean[] = [];

isOpen.subscribe((value) => {
    mut_seen.push(value);
});

open();

// Already open: nothing is passed on.
open();

toggle();

close();

assert.deepStrictEqual(mut_seen, [false, true, false]);
```

## Events: `createEventEmitter`, `createValueEmitter` and `source`

A state holds a value and drops a write equal to it. An event holds nothing until it first fires, and every emission propagates, equal to the last or not: two clicks are two clicks. Several values given before an update delivers them are each delivered in an update of their own, in order.

```tsx
import {
    createEventEmitter,
    createValueEmitter,
    scan,
    source,
} from 'synstate-next';
import { Optional } from 'ts-std-forge';

// An event holds nothing until it first fires, and every `emit` passes on,
// equal to the last or not.
const [clicked, click] = createEventEmitter();

const clicks = clicked.pipe(scan((n) => n + 1, 0));

click();

click();

assert.strictEqual(clicks.value, 2);

const [keyPressed, pressKey] = createValueEmitter<string>();

const mut_keys: string[] = [];

keyPressed.subscribe((key) => {
    mut_keys.push(key);
});

pressKey('a');

pressKey('a');

assert.deepStrictEqual(mut_keys, ['a', 'a']);

// Both are `source()`, with the function taken off.
const messages = source<string>();

assert.isFalse(messages.hasValue);

messages.emit('hello');

assert.deepStrictEqual(messages.getSnapshot(), Optional.some('hello'));
```
