# synstate-preact-signals

[Preact Signals](https://preactjs.com/guide/v10/signals/) integration for [SynState](https://github.com/noshiro-pf/synstate).

Provides a bidirectional bridge between synstate observables and `@preact/signals`, enabling fine-grained DOM updates without component re-renders.

## Installation

```sh
npm install synstate-preact-signals synstate preact @preact/signals
```

## API

### `toSignal(observable$)` — Observable to ReadonlySignal

Converts a synstate observable into a Preact `ReadonlySignal`. The signal stays in sync with the observable and can be embedded directly in JSX.

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

### `fromSignal(signal)` — Signal to Observable

Converts a Preact Signal into a synstate observable, allowing you to apply synstate's operator chain.

```tsx
import { signal } from '@preact/signals';
import { debounce } from 'synstate';
import { fromSignal } from 'synstate-preact-signals';

const input = signal('');

const [input$, dispose] = fromSignal(input);

const debouncedInput$ = input$.pipe(debounce(300));
```

### `createState` / `createBooleanState` / `createReducer`

Signal-returning wrappers for synstate's state creation utilities. Instead of returning a hook (like `synstate-preact-hooks`), these return a `ReadonlySignal`.

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

## Comparison with `synstate-preact-hooks`

| Feature              | `synstate-preact-hooks`           | `synstate-preact-signals`    |
| -------------------- | --------------------------------- | ---------------------------- |
| Preact dep           | `preact`                          | `preact` + `@preact/signals` |
| Read value           | `useObservableValue(obs$)` (hook) | `toSignal(obs$)` (signal)    |
| Re-render scope      | Entire component                  | Only affected DOM nodes      |
| Hooks required       | Yes                               | No                           |
| Operator integration | Via hooks                         | Via `fromSignal`             |

## License

Apache-2.0
