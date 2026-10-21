---
title: Installation
description: Set up the JSX transform and render a first component.
---

## Install

synstate-dom is not on npm yet. Once it is published, it is installed with its two peer dependencies, which have to be the same instances the application uses:

```sh
npm install synstate-dom synstate ts-data-forge
```

## Configure the JSX transform

Set the JSX transform to synstate-dom in `tsconfig.json`. Nothing else is needed: the transform is TypeScript's own, and any bundler that reads `jsxImportSource` (Vite, esbuild) follows it.

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

`render(App, container)` takes the component itself, not `<App />`, and calls it once inside a root scope. The function it returns unmounts the app: it disposes every subscription and derivation the app made and removes its nodes.

Text in JSX is a `Bindable` too, which is why the label is `constant('+1')` rather than `+1`. [Bindable values](/mono/synstate-dom/guides/bindable/) explains why.
