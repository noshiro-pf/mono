---
title: Low-level API
description: mountable, mountChild, isChild and Switch, for DOM that JSX cannot describe.
---

JSX describes most of a page. For the rest (a canvas drawn by hand, a third-party widget, an error boundary that catches a mount, a router) there are four functions. They are what the control-flow components are made of, so code written with them follows the same rules: it runs in the owner it is mounted in, and goes with it.

## `mountable`

`mountable(mount)` is a description whose function creates the nodes itself and returns them: one node, or several in order. `mount` runs where the description is mounted, in its owner and its namespace, and again on each mount, so the same description may be mounted any number of times.

```tsx
import { mountable, mountChild, type JSX } from 'synstate-dom-next';
import { counter, map, withInitialValue } from 'synstate-next';

// A canvas drawn by hand, with a caption the JSX way.
export const Sparkline = ({
    points,
}: Readonly<{ points: readonly number[] }>): JSX.Element =>
    mountable(() => {
        const figure = document.createElement('figure');

        const canvas = document.createElement('canvas');

        const context = canvas.getContext('2d');

        for (const [x, y] of points.entries()) {
            context?.fillRect(x * 4, 40 - y, 3, y);
        }

        figure.append(canvas);

        // Mounted in this description's owner: the counter, and the text that
        // follows it, go when the sparkline is unmounted.
        mountChild(
            <figcaption>
                {counter(1000).pipe(
                    map((s) => `drawn ${s + 1} s ago`),
                    withInitialValue('drawn just now'),
                )}
            </figcaption>,
            figure,
        );

        return figure;
    });
```

The first and last nodes returned are where the mount begins and ends: a `For` row or a branch is moved and removed by them. While it is mounted they stay where they are, and nothing is inserted outside them. What changes goes inside an element they hold, through a binding or `mountChild`. A `mountable` that later replaces its own root, or inserts siblings next to it, leaves nodes behind when it is removed.

## `mountChild`

`mountChild(child, parent?)` mounts anything JSX accepts as a child and returns its nodes, in order: it is what a `mountable` puts inside the elements it creates.

- What the child makes (a binding, a `Switch`, a subscription) belongs to an owner of its own under the current one, and goes when that does.
- Given `parent`, the nodes are appended to it in one insertion and created in its namespace: SVG inside an `<svg>` built by hand, HTML inside its `<foreignObject>`. Without, they are created in the namespace of the mount under way, and the caller places them.
- A child that throws partway fails the call and leaves nothing of itself: what it made before is disposed, and nothing is appended. That is enough for an error boundary:

```tsx
import { constant, mountable, mountChild, type JSX } from 'synstate-dom-next';

// Mounts `children`, or `fallback` when mounting them throws. What the children
// made before the throw is disposed by `mountChild`, so nothing of them stays.
export const ErrorBoundary = ({
    children,
    fallback,
}: Readonly<{ children: JSX.Element; fallback: JSX.Element }>): JSX.Element =>
    mountable(() => {
        const box = document.createElement('div');

        try {
            mountChild(children, box);
        } catch (error) {
            console.error(error);

            mountChild(fallback, box);
        }

        return box;
    });

export const Page = (): JSX.Element => (
    <ErrorBoundary fallback={<p>{constant('Something went wrong.')}</p>}>
        <Chart />
    </ErrorBoundary>
);

const Chart = (): JSX.Element => {
    throw new Error('no data');
};
```

- The nodes are not removed when the owner goes. A `parent` the `mountable` created goes with its element; to mount into an element that outlives the mount, use `Portal`.
- Called outside every owner (from an event handler, say), what it makes is never disposed, and it warns.

## `isChild`

`isChild(value)` tells a child from any other value at run time, for a component that takes either children or something else in one prop. It looks one level deep: a string, a number, an observable, a description, or any array, whatever the array holds. An element of an array that is not a child (`null`, an object) mounts as an empty text node.

## `Switch` for a router

`Switch` (see [Control flow](/mono/synstate-dom-next/guides/control-flow/#switch)) is public so that a router need not copy the branch component it mounts its pages with. A router is then a component, with no low-level code at all:

```tsx
import { constant, listenInScope, Switch, type JSX } from 'synstate-dom-next';
import { createState } from 'synstate-next';
import type { ReadonlyRecord } from 'ts-type-forge';

// A hash router is a component: `Switch` keeps a page mounted while its path
// stays, and `listenInScope` stops listening when the router is unmounted.
export const HashRouter = ({
    pages,
    notFound,
}: Readonly<{
    pages: ReadonlyRecord<string, () => JSX.Element>;
    notFound: JSX.Element;
}>): JSX.Element => {
    const [path$, setPath] = createState(location.hash.slice(1));

    listenInScope(globalThis, 'hashchange', () => {
        setPath(location.hash.slice(1));
    });

    return (
        <Switch value={path$} key={(path) => path}>
            {(path) => pages[path]?.() ?? notFound}
        </Switch>
    );
};

export const App = (): JSX.Element => (
    <HashRouter
        pages={{
            '': () => <p>{constant('Home')}</p>,
            about: () => <p>{constant('About')}</p>,
        }}
        notFound={<p>{constant('Not found')}</p>}
    />
);
```

## What is not here

synstate-dom's `toNodes`, `createMountable` and the `Mountable` and `MountedNodes` types are not rebuilt. A description is a `JSX.Element`, so there is no separate mountable type, and the factory JSX compiles to is `jsx` from `synstate-dom-next/jsx-runtime`.
