---
title: Components
description: Props that take Bindable values and need no special handling, read-once props, and children.
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

With `mapBindable` and `derive` (see [Bindable values](/mono/synstate-dom/guides/bindable/#receiving-a-bindable-mapbindable-derive-toobservable)), a constant passed in stays a constant and never enters the graph.

## Props are plain JavaScript

A prop that takes data holds a bindable (an observable, a constant or a view) itself, not a value read from it, so nothing about it is special. The usual JavaScript ways of handling a function's arguments all work on props, and the updates keep flowing:

```tsx
import { createState } from 'synstate';
import {
    constant,
    derive,
    If,
    mapBindable,
    type Bindable,
    type JSX,
} from 'synstate-dom';

type CountedTextAreaProps = Readonly<{
    label: Bindable<string>;
    value: Bindable<string>;
    onInput: (value: string) => void;
    maxLength?: Bindable<number>;
}>;

type FieldProps = Readonly<{ hint: Bindable<string> }> & CountedTextAreaProps;

export const Compose = (): JSX.Element => (
    <Field
        label={constant('Message')}
        hint={constant('Plain text only.')}
        value={draft$}
        onInput={setDraft}
    />
);

// A helper takes bindables and returns one, like any other function.
const remainingOf = (
    value: Bindable<string>,
    maxLength: Bindable<number>,
): Bindable<number> => derive([value, maxLength], (v, max) => max - v.length);

// A component called only while its branch is mounted, so its text is
// derived only while it is shown.
const CharactersLeft = ({
    count,
}: Readonly<{ count: Bindable<number> }>): JSX.Element => (
    <small>{mapBindable(count, (n) => `${n} characters left`)}</small>
);

const CountedTextArea = ({
    label,
    value,
    onInput,
    // A default is a destructuring default.
    maxLength = constant(140),
}: CountedTextAreaProps): JSX.Element => {
    // Computed in the component body and kept in a variable, and it still
    // updates: `remaining` is a bindable derived from the props, not a number
    // read once.
    const remaining = remainingOf(value, maxLength);

    return (
        <span>
            <label>
                {label}
                <textarea
                    value={value}
                    onInput={(event) => {
                        onInput(event.currentTarget.value);
                    }}
                />
            </label>
            {/* The price: a derived value that updates is built as a bindable,
          and an element shown depending on an updating value is `If`,
          not `&&` or `? :`. */}
            <If
                cond={mapBindable(remaining, (n) => n < 0)}
                then={<strong>{constant('Too long')}</strong>}
                else={<CharactersLeft count={remaining} />}
            />
        </span>
    );
};

// The props this component does not use itself are forwarded with a rest
// pattern.
const Field = ({ hint, ...textArea }: FieldProps): JSX.Element => (
    <div>
        <CountedTextArea {...textArea} />
        <p>{hint}</p>
    </div>
);

const [draft$, setDraft] = createState('');
```

- Destructure props.
- Give a prop a default with a destructuring default: `maxLength = constant(140)`.
- Forward the props you do not use with a rest pattern, `{ hint, ...textArea }`, and spread them onto another component.
- Compute something in the component body, keep it in a variable, or pass props to a helper function.

In Solid, each of these comes with a rule. Props are an object of getters, so reading one in the component body, outside JSX and outside a tracking scope such as `createMemo` or `createEffect`, reads it only once. Destructuring is such a read. A default therefore needs `mergeProps`, forwarding the rest needs `splitProps`, and a value computed in the component body has to be wrapped in `createMemo` or a function. Break the rule and the code still compiles and shows the first value; it just stops updating. Lint (`solid/reactivity`, `solid/no-destructure`) can point that out, but `tsc` cannot. synstate-dom has no such rules for handling props: what updates is whatever has a `Bindable` type.

### The price: derived values are built as bindables

That freedom comes from props being bindables rather than values, and it cuts the other way too. In Solid, a derived value is an expression, such as `{props.maxLength - props.value.length}` in JSX, and the compiler keeps it up to date. In synstate-dom you cannot write that expression inline. You pass the computation to a function that builds the derivation as a new bindable:

- from one input: `mapBindable` (or, when you hold an observable, `view` or `pipe(map(...))`);
- from several inputs: `derive([a, b], fn)`;
- anything that waits, filters or debounces: synstate's operators, reached through `toObservable`, with `withInitialValue` before the result is bound;
- an element shown depending on an updating value: `If` given a `Bindable<boolean>` (or `MatchOptional` / `MatchResult`), not `&&` or `? :` around JSX.

So the same component takes more code than in Solid, and writing it means knowing these helpers and, beyond them, synstate's operators. In return, each derivation is a value with a type that you can name, keep and pass on, as `remaining` is above.

## Read-once props

If the component reads a prop only once, as an initial value, type it `Constant<T>`:

```tsx
import { createState } from 'synstate';
import { constant, type Constant, type JSX } from 'synstate-dom';

export const Form = (): JSX.Element => <Stepper initial={constant(10)} />;

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
```

The caller then has to write `initial={constant(10)}`; an observable or a plain number is a type error. So the fact that the value is read only once shows up in the type, not in a naming convention. Inside the component, you use a `Constant<T>` just like a `T`.

## Children

```tsx
import { constant, type Child, type JSX } from 'synstate-dom';

type CardProps = Readonly<{
    title: JSX.Element;
    children: Child;
}>;

export const Page = (): JSX.Element => (
    <Card title={<em>{constant('Welcome')}</em>}>
        <p>{constant('Components are plain functions, called once.')}</p>
    </Card>
);

// Children and elements passed as props are descriptions, mounted where the
// component puts them.
const Card = ({ title, children }: CardProps): JSX.Element => (
    <section class={constant('card')}>
        <h2>{title}</h2>
        {children}
    </section>
);
```

`children` and elements passed as props are descriptions. They mount wherever the component puts them, as many times as it puts them. `Child` is anything JSX accepts as a child: an element, a `Bindable<string | number>`, or an array of those.

## No context

There is no `createContext`. Keep application state in a module-level store that any component can import. For an observable that only one subtree should see, pass it down through props. That costs nothing: each component is called once, so passing the same observable through the components in between re-runs none of them.

## Naming

The library's own props have no `$` suffix (`cond`, `items`, `value`), because they take a `Bindable`, which may be a constant or a view as well as an observable. The samples do give a `$` suffix to variables that hold an observable (`count$`, `item$`), as the synstate documentation does. Neither is enforced, and whether your own components' props carry the suffix is up to you.
