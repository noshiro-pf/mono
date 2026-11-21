---
title: Preact Signals
description: synstate-preact-signals, a bridge between synstate observables and Preact Signals in both directions.
---

`synstate-preact-signals` bridges synstate observables and [Preact Signals](https://preactjs.com/guide/v10/signals/) in both directions. A signal put in JSX updates the DOM node that shows it, with no render of the component, so a value derived by synstate's operators reaches the page with the same fine-grained update.

```sh
npm install synstate synstate-preact-signals preact @preact/signals
```

The package re-exports everything synstate exports except `createState`, `createReducer` and `createBooleanState`, which it replaces with versions that return a `ReadonlySignal`.

## From an observable to a signal

`toSignal(observable)` gives a `ReadonlySignal` that follows the observable:

```tsx
import type * as Preact from 'preact';
import { createState } from 'synstate';
import { toSignal } from 'synstate-preact-signals';

const [count$, setCount] = createState(0);

const countSignal = toSignal<number>(count$);

const Counter = (): Preact.JSX.Element => {
    // No hooks needed — only this text node updates, not the whole component
    return (
        <div>
            <span>{countSignal}</span>
            <button
                onClick={() => {
                    setCount(countSignal.value + 1);
                }}
            >
                {'+1'}
            </button>
        </div>
    );
};
```

## From a signal to an observable

`fromSignal(signal)` gives an observable of the signal's value, so that synstate's operators, the async ones included, can follow a signal:

```tsx
import { signal } from '@preact/signals';
import { debounce } from 'synstate';
import { fromSignal } from 'synstate-preact-signals';

const input = signal('');

const [input$, dispose] = fromSignal(input);

const debouncedInput$ = input$.pipe(debounce(300));
```

Called inside an owner (a `switchMap` projection, a synstate-dom row or branch), the bridge stops following the signal when that owner is disposed. Elsewhere, call the `dispose` it returns once it is no longer needed.

## A state as a signal

`createState`, `createBooleanState` and `createReducer` return a signal in place of the hook that `synstate-preact-hooks` returns:

```tsx
import type * as Preact from 'preact';
import { createState } from 'synstate-preact-signals';

const [countSignal, setCount, { updateState, resetState }] = createState(0);

const Counter = (): Preact.JSX.Element => (
    <div>
        <span>{countSignal}</span>
        <button
            onClick={() => {
                updateState((n) => n + 1);
            }}
        >
            {'+1'}
        </button>
        <button onClick={resetState}>{'Reset'}</button>
    </div>
);
```

[Operators on signals](/mono/synstate/comparison/operators-on-signals/) says why the operators stay on the synstate side of the bridge: a signal holds a value, and an event or an ordering that passes through one is lost.
