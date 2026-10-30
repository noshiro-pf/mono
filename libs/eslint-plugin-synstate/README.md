# eslint-plugin-synstate

ESLint rules for [`synstate`](https://www.npmjs.com/package/synstate) that catch what its types cannot — e.g. a `counter(...)` that is piped without a name and without a `times` option, so that nothing can ever stop it.

## Installation

```sh
npm install --save-dev eslint-plugin-synstate
```

Requires ESLint 9+ (flat config). The rules read the syntax and need no TypeScript project; `no-write-during-propagation` also follows imported setters when the config provides type information.

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

| Rule                             | Description                                                                                                                                                                          |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-identity-map`                | Require `skipIfNoChange()` instead of `map((x) => x)`, which changes no value and only stops a repeated one. Fixable.                                                                |
| `no-redundant-skip-if-no-change` | Disallow `skipIfNoChange()` directly after `map`, an operator built on it, or another `skipIfNoChange()`, which already stop a value equal (`Object.is`) to the one before. Fixable. |
| `no-throw-in-operator`           | Disallow `throw` in a function passed to a synstate operator. The exception stops the update midway, leaving part of the graph updated; return a `Result` instead.                   |
| `no-unbounded-counter-pipe`      | Disallow calling `.pipe` directly on `counter(...)` when it has no `times` option. Nothing holds the counter, so nothing can complete it, and it never ends.                         |
| `no-write-during-propagation`    | Disallow writing to a synstate state or source from a subscriber or a projection. The write starts an update inside the one that called it, outside the graph synstate orders.       |
| `prefer-derive`                  | Require `derive(parents, fn)` instead of `combine(parents).pipe(map(fn))`, which is two observables and builds a tuple on every update. Fixable.                                     |
| `prefer-map-to`                  | Require `mapTo(c)` instead of `map(() => c)`. `map` stops a result equal to the one it holds, so a `map` to a constant emits once and never again. Fixable.                          |

### `no-identity-map`

`map` passes on a result only when it is not `Object.is` the one it holds, so
`x$.pipe(map((x) => x))` changes no value and only stops one equal to the
value before. That is `skipIfNoChange()`, written as something that reads like
it does nothing; the rule rewrites it to `skipIfNoChange()`, adding the import
when the file has none. Remove the operator instead when nothing needs
stopping.

Reported is a `map` given one function, not `async`, that returns its one
parameter: an arrow, or a function whose body is that `return`. A `map` given
`equals` is left alone, since its author has said how results compare. Type
syntax in the call — an annotated parameter or return type, type arguments, or
`as`, `satisfies` or `!` around the function or the result — may be what the
`map` was written for, so such a call is reported without a fix; to widen the
type, annotate the variable that holds the result instead. `map` is
recognized imported from `synstate` by name, under an alias or through a
namespace import. A callee in a type wrapper, a comment in the call, or a file
where `skipIfNoChange` names something else is reported without a fix.

### `no-redundant-skip-if-no-change`

`map` passes on a result only when it is not `Object.is` the one it holds, so
`layout$.pipe(map((l) => l.mode)).pipe(skipIfNoChange())` compares every
result twice and keeps one more observable for nothing. The rule removes the
`.pipe(skipIfNoChange())`. The same holds after the operators synstate builds
on `map` — `pluck` (`getKey`), `mapOptional`, `mapResultOk`, `mapResultErr`,
`unwrapOptional`, `unwrapResultOk`, `unwrapResultErr` — and after a
`skipIfNoChange()` that compares with `Object.is` itself: of the values these
pass on, none is `Object.is` the one before.

Only `skipIfNoChange` (or `distinctUntilChanged`) given no comparison or
`Object.is` is reported, piped directly onto `x.pipe(op)` where `op` is one of
those: a `map` given no `equals`, an operator built on `map`, or
`skipIfNoChange` comparing with `Object.is`. A comparison of its own may stop
more than `Object.is`, a `map` with `equals` may pass equal results on, `mapTo`
emits on every source value, and an operator in between (`withInitialValue`)
may emit a value the one before it never compared. An observable reached
through a name is not followed. The operators are recognized imported from
`synstate` by name, under an alias or through a namespace import, and read
through `as`, `satisfies`, `!` and parentheses, which the fix keeps around the
observable before. A comment inside the removed text leaves the report without
a fix.

### `no-throw-in-operator`

synstate calls the functions given to its operators while an update
propagates, and catches nothing they throw. A `throw` in
`text$.pipe(map((text) => { if (text === '') throw new Error('empty'); ... }))`
stops the update where it is and reaches whoever wrote to the source: the
nodes the update already reached hold the new value, those it had not reached
keep the old one, and a subscriber that reads both sees them disagree until
the next update. Make the function pure and return the failure as a value,
which the graph carries like any other —
`map((text) => (text === '' ? Result.err('empty') : Result.ok(text)))` — and
handle it downstream with `mapResultOk`, `unwrapResultOk` or
`filter(Result.isOk)`.

Reported is a `throw` directly in a function given to a synstate operator
called in `.pipe(...)` — as an argument, or as a property of an options object
(`map(f, { equals })`) — unless a `try` with a `catch` in the same function
encloses it. A function passed by name counts when the file defines it (a
function declaration, or a `const` bound to a function), and so does a
function of the file that the callback calls, at any depth: the rule reports
the call in the callback, naming the function that throws. The operators are
recognized imported from `synstate` by name, under an alias or through a
namespace import, and read through `as`, `satisfies`, `!` and parentheses.

Not reported: a `throw` in a function the callback only defines (a `.then`
callback, which runs after the update), in an `async` function (whose `throw`
rejects the promise it returns), a function imported from another file, and a
call that throws without a `throw` of the file, such as `JSON.parse` or
`Result.unwrapThrow`. The rule reads the syntax only; a file with no `throw`
costs it one look at each call.

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
to an operator inside `.pipe(...)`, to what a synstate factory returned:

- the setter of `createState`, and its `updateState` and `resetState`;
- the `dispatch` of `createReducer`;
- `setTrue`, `setFalse`, `setState`, `toggle`, `updateState` and `resetState`
  of `createBooleanState`;
- the emitter of `createEventEmitter` and `createValueEmitter`;
- `next` of a `source()`.

A subscriber or projection passed by name counts when the file defines it
(a function declaration, or a `const` bound to a function). So does a function
of the file that the callback calls, at any depth: the rule reports the call
in the callback, naming the function that writes.

The factories are recognized imported from `synstate` by name, under an alias
or through a namespace import, and the calls are read through `as`,
`satisfies`, `!` and parentheses. A setter made in the same file is judged from
the syntax alone. A setter imported from another file, such as a store module
exporting `const [count$, setCount] = createState(0)`, is judged only with
type information (`parserOptions.projectService`): the rule follows the import,
through re-exports, to the declaration it came from, and reads that file's
factory call the same way. Without type information it is not reported. The
rule builds no program of its own, so with type information its added cost is
one symbol lookup per call in a callback.

What the rule does not follow is left to synstate's warning at run time. That
covers a write in a function the callback merely defines (a `setTimeout`
callback, which runs after the update, so it is correct), a setter passed as an
argument or kept in an object, and a function imported from another file and
called from the callback.

### `prefer-derive`

`combine(parents)` emits a tuple of its parents' latest values, so deriving one
value from several — `combine([a$, b$]).pipe(map(([a, b]) => a + b))` — takes
two observables, and every update builds a tuple only for `map` to take apart.
`derive([a$, b$], (a, b) => a + b)` is one observable that calls the function
with the values as arguments. It stops a result `Object.is` the one it holds,
as `map` does, and takes `map`'s `equals` as its own, so the rewrite changes
nothing that is emitted.

Every `.pipe` whose one operator is `map`, called on `combine(...)` or its alias
`combineLatest(...)`, is reported, unless the `map` is one `prefer-map-to` or
`no-identity-map` reports (`map(() => c)`, `map((xs) => xs)`). The fix
turns an array pattern into the parameters (`([a, b]) =>` to `(a, b) =>`) and
a name into a rest parameter (`(xs) =>` to `(...xs) =>`), adding the import of
`derive` when the file has none. It is not offered for a mapping function that is not an arrow function
written in place, a parameter with a type annotation, a default, a `?` or a
hole, a `combine(...)` or its `.pipe` in a type wrapper or parentheses, a
`combine` or `map` callee in a type wrapper, a parameter followed by a comma,
type arguments on any of the three calls, or a comment between the calls,
which the rewrite would drop.

### `prefer-map-to`

`map` passes on a result only when it is not `Object.is` the one it holds, so
that a derived value that did not change wakes nothing below it. A `map` that
turns events into a constant — `click$.pipe(map(() => true))`,
`reset$.pipe(map(() => 'reset' as const))` — therefore emits on the first event
and on none after it. `mapTo(true)` emits on every one, and the rule rewrites
the call to it, adding the import when the file has none.

Only a body that is the same value every time it runs is reported, because
`mapTo` evaluates its value once: a literal other than a regular expression, a
template literal with no expression, `undefined`, a `const` or an import, or
`-`, `+`, `!` or `void` of one of those. A body that calls something or builds
an object or array is left alone; a new object each time is never equal, so
such a `map` emits on every event already. A `map` given `equals` is left alone
too, since its author has said how results compare. When the event maps to a
value that can repeat but is not constant — a request mapped to the id it is
for — give the `map` `{ equals: () => false }`; the rule cannot tell such a
`map` from a derived state and does not report it.

`map` is recognized imported from `synstate` by name, under an alias or
through a namespace import, and the body is read through `as`, `satisfies`,
`!` and parentheses, which the fix keeps. A callee in a type wrapper, or a file
where `mapTo` names something else, is reported without a fix.

## License

[Apache-2.0](https://github.com/noshiro-pf/mono/blob/main/libs/eslint-plugin-synstate/LICENSE)
