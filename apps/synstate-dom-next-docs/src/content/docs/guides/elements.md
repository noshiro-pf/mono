---
title: Elements
description: Attributes, properties, class, style, events, ref and SVG.
---

The props of an intrinsic element are generated from `lib.dom.d.ts`, so your editor completes them and checks their types. Each writable primitive DOM property of the element (`id`, `disabled`, `value`, `tabIndex`, …) takes a `Bindable` of its type, `aria-*` takes a `Bindable` of a string, a number or a boolean (written as `"true"` / `"false"`), `data-*` takes a `Bindable<string>`, and each event gets its own handler.

Each prop bound to an observable is one binding: a small object holding the element and the name it writes, run after each update that changes the observable. A prop given a constant is written once, while the element is created, and makes nothing.

## Attributes and properties

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';

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
            disabled={agreed$.pipe(map((agreed) => !agreed))}
        >
            {constant('Sign up')}
        </button>
    </div>
);
```

- Most props are written with `setAttribute`. A few, such as `value`, `checked`, `selected` and `indeterminate`, have an attribute that drifts apart from the live value as the user interacts; those are written as DOM properties instead (`element.value = v`).
- A bound `checked` or `indeterminate` of an `<input>` is controlled. After a `change`, the input is set back to its bound value in the next animation frame or task, whichever comes first, so a change your `onChange` does not take undoes itself before it is painted, as in the checkbox above if `toggleAgreed` were not called. It is restored in a hidden page too, where no frame is drawn. To let the user toggle a checkbox freely, give it `defaultChecked` instead. In a radio group, bind every button.
- A boolean attribute such as `disabled` takes a `Bindable<boolean>` and is removed while its value is `false`.

## `class` and `style`

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';

const [isActive$] = createBooleanState(false);

const [progress$] = createState(0.3);

export const Item = (): JSX.Element => (
    // One `Bindable<boolean>` per class name: each is toggled on its own.
    <li class={{ item: constant(true), active: isActive$ }}>
        {/* Or the whole class as one string. Never both on one element. */}
        <span class={isActive$.pipe(map((active) => (active ? 'on' : 'off')))}>
            {constant('status')}
        </span>
        {/* One `Bindable<string>` per hyphenated CSS property name. */}
        <div
            style={{
                width: progress$.pipe(map((p) => `${p * 100}%`)),
                'background-color': constant('teal'),
            }}
        />
    </li>
);
```

- `class` takes either one `Bindable<string>`, or an object with one `Bindable<boolean>` per class name, where each class is toggled on its own with `classList.toggle`. Do not use both on one element: writing the whole class string would wipe out the classes the object toggled. The object's type is exported as `ClassObject`.
- `style` takes either a `cssText` string, or an object with one `Bindable<string | undefined>` per CSS property (`StyleObject`). Each property is written with `style.setProperty`, so the keys are the hyphenated names (`'background-color'`, `'--accent'`); `undefined` removes it.

## Events and `ref`

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createState, map, onCleanup } from 'synstate-next';

const [position$, setPosition] = createState('');

const [width$, setWidth] = createState(0);

const resizeObserver = new ResizeObserver((entries) => {
    setWidth(entries[0]?.contentRect.width ?? 0);
});

export const Pad = (): JSX.Element => (
    <div
        ref={(element) => {
            // Called once, right after the element is created and before anything is
            // bound or its children are mounted, in the owner the element mounts in.
            resizeObserver.observe(element);

            onCleanup(() => {
                resizeObserver.unobserve(element);
            });
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
        {width$.pipe(map((w) => ` in a pad ${Math.round(w)}px wide`))}
    </div>
);
```

- A handler's name is `on` followed by the event name in PascalCase: `onClick`, `onInput`, `onPointerDown`. `currentTarget` is narrowed to the element's type. A handler is always a function, never an observable.
- A handler is assigned to the element's own `on…` property where the element has one (`element.onclick`), and added with `addEventListener` otherwise. Neither is removed: the element is dropped with the owner that made it, and its handlers with it. Code of yours that assigns `element.onclick` itself replaces the handler.
- `ref` is called once with the element, right after it is created and before anything is bound or its children are mounted. It runs in the owner the element mounts in, so an `onCleanup` there undoes what it started when the element goes.

## SVG

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

const [radius$] = createState(10);

// Everything inside `<svg>` is created in the SVG namespace, down to a
// `<foreignObject>`, whose contents are HTML again.
export const Dot = (): JSX.Element => (
    <svg viewBox={constant('0 0 100 100')} width={constant(100)}>
        {/* `a` and `title` are SVG elements here, because of where they stand. */}
        <a href={constant('#dot')}>
            <title>{constant('A dot')}</title>
            <circle
                cx={constant(50)}
                cy={constant(50)}
                r={radius$}
                fill={radius$.pipe(map((r) => (r > 30 ? 'tomato' : 'teal')))}
            />
        </a>
        <foreignObject
            x={constant(0)}
            y={constant(80)}
            width={constant(100)}
            height={constant(20)}
        >
            {/* HTML again: a real `<p>`, laid out as text. */}
            <p>{radius$.pipe(map((r) => `r = ${r}`))}</p>
        </foreignObject>
    </svg>
);
```

An element's namespace follows where it is mounted, not its tag. Everything inside an `<svg>` is created in the SVG namespace, down to a `<foreignObject>`, whose children are HTML again. So `<a>`, `<title>`, `<script>` and `<style>`, which exist in both, are SVG elements inside an `<svg>` and HTML elements elsewhere. A component mounted inside an `<svg>` creates SVG elements too, wherever it was written.

The types cannot follow that: a JSX element's type cannot depend on where it stands. Tags that only SVG has take a fixed list of attributes, each a `Bindable<number | string>`, since their properties are `SVGAnimatedLength` and the like rather than plain values. `<a>`, `<title>`, `<script>` and `<style>` keep the props of their HTML element, a `ref` included, inside an `<svg>` as well: the `href` of an `<a>` is written as an attribute there, which SVG reads.
