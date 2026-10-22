---
title: Elements
description: Attributes, properties, class, style, events, ref and SVG.
---

The props of an intrinsic element are generated from `lib.dom.d.ts`, so the editor completes them and checks their types: each writable primitive DOM property of the element (`id`, `disabled`, `value`, `tabIndex`, …) as a `Bindable` of its type, `aria-*` and `data-*` as `Bindable<string>`, and one handler per event.

## Attributes and properties

```tsx
import { createBooleanState, createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [name$, setName] = createState('');

const [agreed$, { toggle: toggleAgreed }] = createBooleanState(false);

export const SignUp = (): JSX.Element => (
    <div id={constant('sign-up')} data-step={constant('1')}>
        {/* `value` and `checked` are written as properties, which is what
        stays in step with the user's input. */}
        <input
            value={name$}
            placeholder={constant('Your name')}
            aria-label={constant('Name')}
            onInput={(event) => {
                setName(event.currentTarget.value);
            }}
        />
        <input
            type={constant('checkbox')}
            checked={agreed$}
            onChange={() => {
                toggleAgreed();
            }}
        />
        {/* A boolean attribute is removed while its value is `false`. */}
        <button
            type={constant('submit')}
            disabled={view(agreed$, (agreed) => !agreed)}
        >
            {constant('Sign up')}
        </button>
    </div>
);
```

- Most props are written with `setAttribute`. A few whose attribute and live value drift apart as the user interacts, such as `value`, `checked`, `selected` and `indeterminate`, are written as DOM properties instead (`element.value = v`).
- A boolean attribute such as `disabled` takes a `Bindable<boolean>` and is removed while its value is `false`.

## `class` and `style`

```tsx
import { createBooleanState, createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [isActive$] = createBooleanState(false);

const [progress$] = createState(0.3);

export const Item = (): JSX.Element => (
    // One `Bindable<boolean>` per class name: each is toggled on its own.
    <li class={{ item: constant(true), active: isActive$ }}>
        {/* Or the whole class as one string. Never both on one element. */}
        <span class={view(isActive$, (active) => (active ? 'on' : 'off'))}>
            {constant('status')}
        </span>
        {/* One `Bindable<string>` per hyphenated CSS property name. */}
        <div
            style={{
                width: view(progress$, (p) => `${p * 100}%`),
                'background-color': constant('teal'),
            }}
        />
    </li>
);
```

- `class` is either one `Bindable<string>`, or an object with one `Bindable<boolean>` per class name, each toggled with `classList.toggle` on its own. Never both on one element: writing the whole class string would wipe the classes the object toggled.
- `style` is either a `cssText` string, or an object with one `Bindable<string>` per CSS property. The keys are the hyphenated names (`'background-color'`, `'--accent'`), since each is written with `style.setProperty`.

## Events and `ref`

```tsx
import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [position$, setPosition] = createState('');

const [width$, setWidth] = createState(0);

const resizeObserver = new ResizeObserver((entries) => {
    setWidth(entries[0]?.contentRect.width ?? 0);
});

export const Pad = (): JSX.Element => (
    <div
        ref={(element) => {
            // Called once, right after the element is created and before anything
            // is bound or its children are mounted.
            resizeObserver.observe(element);
        }}
        onPointerMove={(event) => {
            // `currentTarget` is narrowed to the element: HTMLDivElement here.
            const rect = event.currentTarget.getBoundingClientRect();

            setPosition(
                `${Math.round(event.clientX - rect.left)}, ${Math.round(event.clientY - rect.top)}`,
            );
        }}
    >
        {constant('Pointer at ')}
        {position$}
        {view(width$, (w) => ` in a pad ${Math.round(w)}px wide`)}
    </div>
);
```

- A handler is named `on` followed by the event name in PascalCase: `onClick`, `onInput`, `onPointerDown`. `currentTarget` is narrowed to the element's type. A handler is a function, never an observable, and it is removed when the scope it was bound in is disposed.
- `ref` is called once with the element, right after it is created and before anything is bound or its children are mounted.

## SVG

```tsx
import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [radius$] = createState(10);

// `svg` and `circle` are created in the SVG namespace.
export const Dot = (): JSX.Element => (
    <svg viewBox={constant('0 0 100 100')} width={constant(100)}>
        <circle
            cx={constant(50)}
            cy={constant(50)}
            r={radius$}
            fill={view(radius$, (r) => (r > 30 ? 'tomato' : 'teal'))}
        />
    </svg>
);
```

The tags of `SVGElementTagNameMap` that HTML does not have are created in the SVG namespace. SVG properties cannot be read off `lib.dom.d.ts` the way HTML ones are (they are `SVGAnimatedLength` and the like), so SVG elements take a fixed list of attributes, each a `Bindable<number | string>`. `a`, `script`, `style` and `title` exist in HTML too and are always created as HTML elements.
