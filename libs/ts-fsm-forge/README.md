<!-- cspell:ignore doeixd -->

# ts-fsm-forge

A reducer restricted to a declared transition graph, for state and action unions
discriminated by `type`.

A plain reducer `(state, action) => state` accepts every pair of state and
action: for a finite set of state types, its transition graph is complete. Here
the graph is data, and from it come

- **per-edge handlers**, each given the source state and the action already
  narrowed, whose return type is the edge's target state;
- a total **`reducer`** that returns the state unchanged for a pair the graph
  leaves out — for `useReducer`, Redux, or folding a log of actions;
- **`transition`**, which the compiler refuses for such a pair, and **`can`**,
  the type guard that narrows a state to the types that accept an action;
- the graph itself, to list what a state allows or to draw it (`toMermaid`).

Depends on `ts-data-forge` and, for types, `ts-type-forge`.

## Installation

```sh
npm add ts-fsm-forge
```

TypeScript 5.0 or later (the graph is inferred through a `const` type
parameter).

## Defining a machine

The state and action types are given first and the graph is inferred, so the
call is curried. Every state type is listed, one with no outgoing edge as `{}`,
so that adding a state to the union asks where it goes.

```ts
type State = Readonly<
    | { type: 'idle' }
    | { type: 'loading'; startedAt: number }
    | { type: 'success'; data: string }
    | { type: 'failure'; message: string }
>;

type Action = Readonly<
    | { type: 'fetch'; now: number }
    | { type: 'resolve'; data: string }
    | { type: 'reject'; message: string }
    | { type: 'reset' }
>;

export const fetchMachine = defineMachine<State, Action>()(
    // The graph: state type -> action type -> target state type(s).
    {
        idle: { fetch: 'loading' },
        loading: { resolve: 'success', reject: 'failure', reset: 'idle' },
        success: { fetch: 'loading', reset: 'idle' },
        failure: { fetch: 'loading', reset: 'idle' },
    },
    // One handler per edge: `s` and `a` arrive narrowed, and the result must be
    // the edge's target (`loading` here), or the definition does not compile.
    {
        idle: { fetch: (_s, a) => ({ type: 'loading', startedAt: a.now }) },
        loading: {
            resolve: (_s, a) => ({ type: 'success', data: a.data }),
            reject: (_s, a) => ({ type: 'failure', message: a.message }),
            reset: () => ({ type: 'idle' }),
        },
        success: {
            fetch: (_s, a) => ({ type: 'loading', startedAt: a.now }),
            reset: () => ({ type: 'idle' }),
        },
        failure: {
            fetch: (_s, a) => ({ type: 'loading', startedAt: a.now }),
            reset: () => ({ type: 'idle' }),
        },
    },
);
```

The compiler rejects a misspelled action or target, a missing state, a handler
for an edge the graph does not have, and a handler returning another state than
its edge's target. The same checks run when the machine is defined, so a graph
built without its types fails there rather than on the first action.

An edge whose target depends on the payload lists every target, and its handler
returns one of them: `{ fetch: ['loading', 'closed'] }`. A guard that may refuse
the action lists the source state among the targets and returns it.

## The reducer

```ts
// A plain `(state, action) => state`: hand it to `useReducer`, Redux, or
// `Array.prototype.reduce` over a log of actions.
const { reducer } = fetchMachine;

const idle: State = { type: 'idle' } as const;

assert.deepStrictEqual(reducer(idle, { type: 'fetch', now: 1 }), {
    type: 'loading',
    startedAt: 1,
});

// A pair the graph leaves out returns the same state.
assert.strictEqual(reducer(idle, { type: 'resolve', data: 'early' }), idle);

const log: readonly Action[] = [
    { type: 'resolve', data: 'early' }, // ignored: `idle` has no `resolve`
    { type: 'fetch', now: 1 },
    { type: 'fetch', now: 2 }, // ignored: `loading` has no `fetch`
    { type: 'resolve', data: 'ok' },
] as const;

assert.deepStrictEqual(log.reduce(reducer, idle), {
    type: 'success',
    data: 'ok',
});
```

`defineMachine`'s third argument takes `onIllegal(state, action)`, called with
each pair the reducer ignores — to log it in development, say.

## Transitions checked by the compiler

```ts
const s: State = current();

// `transition` takes only what the graph allows from the state's type, and
// returns the edge's target type.
if (s.type === 'loading') {
    const next = fetchMachine.transition(s, { type: 'resolve', data: 'ok' });

    next satisfies Readonly<{ type: 'success'; data: string }>;

    assert.deepStrictEqual(next, { type: 'success', data: 'ok' });
}

assert.throws(() => {
    // @ts-expect-error `idle` has no `resolve` edge.
    fetchMachine.transition({ type: 'idle' }, { type: 'resolve', data: '' });
});

// `can` narrows a state to the types that have the edge.
if (fetchMachine.can(s, 'reset')) {
    s satisfies Readonly<{ type: 'loading' | 'success' | 'failure' }>;

    assert.deepStrictEqual(fetchMachine.transition(s, { type: 'reset' }), {
        type: 'idle',
    });
}

// What a UI may offer in a state:
assert.deepStrictEqual(fetchMachine.allowedActionTypes(s), [
    'resolve',
    'reject',
    'reset',
]);
```

On a union of state types, `transition` accepts only the actions every member
has an edge for, and its result is the union of their targets. When no action is
common to them, the action parameter is `never`: narrow the state first.

The compiler checks a state known when the code is written; a store holds a
state known only when it runs. Between reading a state and dispatching an action
for it — a second click before the next render, an action from another client —
the state may move on. That is why `reducer` checks again and ignores what no
longer applies, and why a store's `dispatch` takes the whole `Action` union.

## Drawing the graph

```ts
assert.strictEqual(
    toMermaid(fetchMachine.graph, { initial: 'idle' }),
    dedent`
    stateDiagram-v2
      state "idle" as s0
      state "loading" as s1
      state "success" as s2
      state "failure" as s3
      [*] --> s0
      s0 --> s1: fetch
      s1 --> s2: resolve
      s1 --> s3: reject
      s1 --> s0: reset
      s2 --> s1: fetch
      s2 --> s0: reset
      s3 --> s1: fetch
      s3 --> s0: reset
  `,
);
```

## API

| Export                                                                                                                     | What it is                                                                          |
| :------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| `defineMachine<S, A>()(graph, handlers, options?)`                                                                         | Returns a `Machine`: `graph`, `reducer`, `transition`, `can`, `allowedActionTypes`. |
| `toMermaid(graph, options?)`                                                                                               | A Mermaid `stateDiagram-v2` of a graph.                                             |
| `TransitionGraph<S, A>`                                                                                                    | The shape of a graph: every state type to its action types to their target(s).      |
| `EdgeHandlers<S, A, G>`                                                                                                    | The shape of the handlers for graph `G`.                                            |
| `Machine<S, A, G>`                                                                                                         | What `defineMachine` returns.                                                       |
| `AllowedActionType<G, K>`, `EdgeActionType<G, K>`, `NextStateType<G, K, T>`, `SourceStateType<G, T>`, `TargetStateType<V>` | The graph read as types.                                                            |

## Compared with

- **XState** sends any event of the machine to an actor and ignores at run time
  the ones the current state does not handle; its context is one type for every
  state. This package is a reducer: no actor, no effects, no hierarchy or
  parallel states, and a payload per state type.
- **Typestate libraries** (`@doeixd/machine`, for instance) give each state
  object the methods it allows. Actions here are plain data, which a log, a
  network or a database can carry.

## License

Apache-2.0
