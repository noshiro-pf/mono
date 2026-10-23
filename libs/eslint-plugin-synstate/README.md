# eslint-plugin-synstate

ESLint rules for [`synstate`](https://www.npmjs.com/package/synstate) that catch what its types cannot — e.g. a `counter(...)` that is piped without a name and without a `times` option, so that nothing can ever stop it.

## Installation

```sh
npm install --save-dev eslint-plugin-synstate
```

Requires ESLint 9+ (flat config). The rules read the syntax only and need no TypeScript project.

## Usage (flat config)

The plugin ships a `recommended` config preset that registers the plugin and
turns on **every** rule at `error`:

```ts
// eslint.config.mts
import { eslintPluginSynstate } from 'eslint-plugin-synstate';

export default [eslintPluginSynstate.configs.recommended];
```

Since the preset is a plain flat-config object, individual rules can be
adjusted by a later config entry:

```ts
// eslint.config.mts
import {
    eslintPluginSynstate,
    type EslintSynstateRules,
} from 'eslint-plugin-synstate';

export default [
    eslintPluginSynstate.configs.recommended,
    {
        files: ['**/*.test.mts'],
        rules: {
            'synstate/no-unbounded-counter-pipe': 'off',
        } satisfies Partial<EslintSynstateRules>,
    },
];
```

Or register the plugin yourself and pick the rules one by one:

```ts
// eslint.config.mts
import {
    eslintPluginSynstate,
    type EslintSynstateRules,
} from 'eslint-plugin-synstate';

export default [
    {
        plugins: { synstate: eslintPluginSynstate },
        rules: {
            'synstate/no-unbounded-counter-pipe': 'error',
        } satisfies Partial<EslintSynstateRules>,
    },
];
```

## Rules

| Rule                          | Description                                                                                                                                                                    |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-unbounded-counter-pipe`   | Disallow calling `.pipe` directly on `counter(...)` when it has no `times` option. Nothing holds the counter, so nothing can complete it, and it never ends.                   |
| `no-write-during-propagation` | Disallow writing to a synstate state or source from a subscriber or a projection. The write starts an update inside the one that called it, outside the graph synstate orders. |

### `no-unbounded-counter-pipe`

`counter(1000).pipe(take(3))` reads like three ticks, but `take(3)` completes
the observable it returns, not the counter underneath. The next major of
synstate stops completing parents when a child completes (its `NEXT_MAJOR.md`),
and from then on the only ways to stop a counter are to complete it through a
name or to let it stop by itself. A counter piped straight from its call has no
name, so without a `times` option it keeps its timer running for as long as the
program lives.

The type cannot forbid this `.pipe`, because the same call is fine once the
counter has a name: `const counter$ = counter(1000)` can be completed through
`counter$` when it is no longer needed. The rule therefore reports a `.pipe`
whose receiver is the `counter(...)` call itself, and accepts either fix:

- pass `{ times: N }`, so that the counter completes by itself after `N`
  emissions: `counter(1000, { times: 3 }).pipe(...)`;
- bind the counter to a name and complete it yourself.

It recognizes `counter` imported from `synstate` by name, under an alias or
through a namespace import, and reads through `as`, `satisfies`, `!` and
parentheses. Options it cannot see into — a variable, a spread, a computed
key — are assumed to carry `times`, and are not reported.

### `no-write-during-propagation`

`a$.subscribe((a) => { setB(a * 2); })` reads like "keep `b$` at twice `a$`",
but the write is not part of the graph. It starts a second update while the
first is still propagating, so synstate cannot order it with the rest: a
subscriber can see `a$` updated and `b$` not yet, a node that reads both can
emit twice for one write, and a write back into the update that called it,
directly (`a$.subscribe((a) => { setA(a + 1); })`) or through another state,
recurses until synstate stops it. synstate warns at run time, once per state;
this rule reports the write where it is written. Derive the value instead, so
that the graph has the edge: `const b$ = a$.pipe(map((a) => a * 2))`.

It reports a call, made directly in a function passed to `.subscribe(...)` or
to an operator inside `.pipe(...)`, to what a synstate factory returned in the
same file:

- the setter of `createState`, and its `updateState` and `resetState`;
- the `dispatch` of `createReducer`;
- `setTrue`, `setFalse`, `setState`, `toggle`, `updateState` and `resetState`
  of `createBooleanState`;
- the emitter of `createEventEmitter` and `createValueEmitter`;
- `next` of a `source()`.

The factories are recognized imported from `synstate` by name, under an alias
or through a namespace import, and the calls are read through `as`,
`satisfies`, `!` and parentheses. Only the syntax is read, so a write in a
function the callback merely defines (a `setTimeout` callback, which runs
after the update) is not reported, and neither is a write through a setter
imported from another file or a subscriber passed by name.

## License

[Apache-2.0](https://github.com/noshiro-pf/mono/blob/main/libs/eslint-plugin-synstate/LICENSE)
