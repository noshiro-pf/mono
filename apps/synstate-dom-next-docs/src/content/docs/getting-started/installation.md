---
title: Installation
description: Set up the JSX transform and render a first component.
---

## Install

synstate-dom-next is not published yet. Inside the repository, a package depends on it and on synstate-next as workspace packages:

```jsonc
{
    "dependencies": {
        "synstate-dom-next": "workspace:*",
        "synstate-next": "workspace:*",
    },
}
```

synstate-next is a peer dependency, so your application and synstate-dom-next share one copy of it. A graph cannot span two copies: an observable from another copy is rejected when it is bound. `Optional` and `Result`, which `MatchOptional` and `MatchResult` take, come from ts-std-forge; add it once your application imports them.

## Configure the JSX transform

Point the JSX transform at synstate-dom-next in `tsconfig.json`. That is all you need: the transform is TypeScript's own, so any bundler that reads `jsxImportSource` (Vite, esbuild) picks it up.

```jsonc
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "synstate-dom-next",
    },
}
```

## A first component

```tsx
import { constant, render, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

const [count$, _setCount, { updateState: updateCount }] = createState(0);

// Called once. Only the text node bound to `count$` changes afterwards.
const Counter = (): JSX.Element => (
    <div>
        <p>{count$.pipe(map((n) => `Count: ${n}`))}</p>
        <button
            type={constant('button')}
            onClick={() => {
                updateCount((n) => n + 1);
            }}
        >
            {constant('+1')}
        </button>
    </div>
);

const unmount = render(Counter, document.body);

// Later: disposes every subscription the app made and removes its nodes.
unmount();
```

`render(App, container)` takes the component itself, not `<App />`, and calls it once inside a root owner. Mounting is a batch: a write made while the app mounts propagates once its nodes are in `container`. `render` returns a function that unmounts the app: calling it disposes the root owner, and with it every binding, derivation and subscription the app made, and removes its nodes.

Text in JSX is a `Bindable` too, so you write the label as `constant('+1')` rather than `+1`. [Bindable values](/mono/synstate-dom-next/guides/bindable/) explains the reason.
