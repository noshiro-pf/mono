---
title: Installation
description: Set up the JSX transform and render a first component.
---

## Install

Install synstate-dom together with synstate, which your application imports to create its state. synstate is a peer dependency, so your application and synstate-dom share one instance:

```sh
npm install synstate-dom synstate
```

The other peer dependency, ts-data-forge, comes along as a dependency of synstate. Once your application imports it directly, for example for `Optional` in [Control flow](/mono/synstate-dom/guides/control-flow/), add it yourself.

## Configure the JSX transform

Point the JSX transform at synstate-dom in `tsconfig.json`. That is all you need: the transform is TypeScript's own, so any bundler that reads `jsxImportSource` (Vite, esbuild) picks it up.

```jsonc
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "synstate-dom",
    },
}
```

## A first component

```tsx
import { createState } from 'synstate';
import { constant, render, view, type JSX } from 'synstate-dom';

const [count$, _setCount, { updateState: updateCount }] = createState(0);

// Called once. Only the text node bound to `count$` changes afterwards.
const Counter = (): JSX.Element => (
    <div>
        <p>{view(count$, (n) => `Count: ${n}`)}</p>
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

`render(App, container)` takes the component itself, not `<App />`, and calls it once inside a root scope. It returns a function that unmounts the app: calling it disposes every subscription and derivation the app made and removes its nodes.

Text in JSX is a `Bindable` too, so you write the label as `constant('+1')` rather than `+1`. [Bindable values](/mono/synstate-dom/guides/bindable/) explains the reason.
