---
title: Components
description: Props that take Bindable values, read-once props, and children.
---

A component is a function from props to `JSX.Element`, called once when it is mounted. There is no per-component state or effect API: state is a synstate observable, and what a component shows is bound to it.

## Props are bindables

A component that takes data takes `Bindable<T>`, so that its caller can pass an observable, a constant or a `view` alike:

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

Props hold bindables rather than values that a later render would replace, so destructuring them loses nothing. With `mapBindable` and `derive` (see [Bindable values](/mono/synstate-dom/guides/bindable/#receiving-a-bindable-mapbindable-derive-toobservable)), a constant passed in stays a constant and never enters the graph.

## Read-once props

A prop the component reads only once, as an initial value, is typed `Constant<T>`:

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

The caller then has to write `initial={constant(10)}`: an observable or a plain number is a type error. That the value is read once shows in the type, not in a naming convention. Inside the component, a `Constant<T>` is used as a `T`.

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

`children` and elements passed as props are descriptions; they are mounted where the component puts them, as many times as it puts them. `Child` is what JSX accepts as a child: an element, a `Bindable<string | number>`, or an array of those.

## No context

There is no `createContext`. Application state is a module-level store that any component imports. An observable that only one subtree should see is passed down through props, which costs nothing: a component is called once, so passing the same observable through intermediate components re-runs none of them.

## Naming

The library's own props carry no `$` suffix (`cond`, `items`, `value`): they take a `Bindable`, which may be a constant or a view as well as an observable. The samples name variables that hold an observable with a `$` suffix (`count$`, `item$`), as the synstate documentation does. Nothing enforces either; whether a component's own props carry the suffix is up to its author.
