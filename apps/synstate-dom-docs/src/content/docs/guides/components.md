---
title: Components
description: Props that take Bindable values, read-once props, and children.
---

A component is a function from props to `JSX.Element`, and it is called once, when it mounts. There is no per-component state or effect API. State lives in synstate observables, and the component binds what it shows to them.

## Props are bindables

When a component takes data, type the prop as `Bindable<T>`. Its caller can then pass an observable, a constant or a `view`:

```tsx
import { createState } from 'synstate';
import {
    constant,
    mapBindable,
    render,
    type Bindable,
    type JSX,
} from 'synstate-dom';

type BadgeProps = Readonly<{
    label: Bindable<string>;
    count: Bindable<number>;
}>;

// Props are plain values holding bindables, so destructuring them is safe:
// the component is called once and binds what it was given.
const Badge = ({ label, count }: BadgeProps): JSX.Element => (
    <span>
        {label}
        {mapBindable(count, (n) => (n > 99 ? ' (99+)' : ` (${n})`))}
    </span>
);

const [unread$, setUnread] = createState(3);

const Inbox = (): JSX.Element => (
    <nav>
        {/* A constant stays a constant: nothing is subscribed for it. */}
        <Badge label={constant('Inbox')} count={unread$} />
        <Badge label={constant('Archive')} count={constant(120)} />
        <button
            type={constant('button')}
            onClick={() => {
                setUnread(0);
            }}
        >
            {constant('Mark all read')}
        </button>
    </nav>
);

render(Inbox, document.body);
```

Props hold bindables, not values that a later render would replace, so you lose nothing by destructuring them. And with `mapBindable` and `derive` (see [Bindable values](/mono/synstate-dom/guides/bindable/#receiving-a-bindable-mapbindable-derive-toobservable)), a constant passed in stays a constant and never enters the graph.

## Read-once props

If the component reads a prop only once, as an initial value, type it `Constant<T>`:

```tsx
import { createState } from 'synstate';
import { constant, type Constant, type JSX } from 'synstate-dom';

// `initial` is read once, when the component is called. Typing it
// `Constant<number>` says so: an observable or a plain number is an error.
const Stepper = ({
    initial,
}: Readonly<{ initial: Constant<number> }>): JSX.Element => {
    const [value$, , { updateState }] = createState<number>(initial);

    return (
        <button
            type={constant('button')}
            onClick={() => {
                updateState((n) => n + 1);
            }}
        >
            {value$}
        </button>
    );
};

export const Form = (): JSX.Element => <Stepper initial={constant(10)} />;
```

The caller then has to write `initial={constant(10)}`; an observable or a plain number is a type error. So the fact that the value is read only once shows up in the type, not in a naming convention. Inside the component, you use a `Constant<T>` just like a `T`.

## Children

```tsx
import { constant, type Child, type JSX } from 'synstate-dom';

type CardProps = Readonly<{
    title: JSX.Element;
    children: Child;
}>;

// Children and elements passed as props are descriptions, mounted where the
// component puts them.
const Card = ({ title, children }: CardProps): JSX.Element => (
    <section class={constant('card')}>
        <h2>{title}</h2>
        {children}
    </section>
);

export const Page = (): JSX.Element => (
    <Card title={<em>{constant('Welcome')}</em>}>
        <p>{constant('Components are plain functions, called once.')}</p>
    </Card>
);
```

`children` and elements passed as props are descriptions. They mount wherever the component puts them, as many times as it puts them. `Child` is anything JSX accepts as a child: an element, a `Bindable<string | number>`, or an array of those.

## No context

There is no `createContext`. Keep application state in a module-level store that any component can import. For an observable that only one subtree should see, pass it down through props. That costs nothing: each component is called once, so passing the same observable through the components in between re-runs none of them.

## Naming

The library's own props have no `$` suffix (`cond`, `items`, `value`), because they take a `Bindable`, which may be a constant or a view as well as an observable. The samples do give a `$` suffix to variables that hold an observable (`count$`, `item$`), as the synstate documentation does. Neither is enforced, and whether your own components' props carry the suffix is up to you.
