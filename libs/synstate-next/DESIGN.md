# synstate-next design

synstate-next is synstate rebuilt from scratch, ignoring the existing code. This
file says what it does differently and why. It is written for whoever continues
the rebuild; the decisions in it were put to the author on 2026-11-06 and taken
as recommended.

## Goal

Match or beat synstate in features, then replace it under the name `synstate` in
one major version. Until then this package is private and changes only in the
rebuild's own pull requests (see README.md). The existing synstate tests are the
oracle: each is ported or listed in "Breaking changes" below with the reason it
no longer holds.

## Propagation

- **One queue, driven by an integer epoch.** An update is a number. A node is
  queued for the current update when its `queuedAt` equals the epoch, so
  queueing allocates nothing and a node with one parent never asks which parent
  changed. synstate allocates an update token per write instead.
- **Depth buckets.** A node's depth is one more than its deepest parent's. The
  drain visits the buckets in ascending depth, so a node is recomputed once per
  update, after all of its parents (no glitches, diamonds included).
- **Queues keep their length in a counter.** `length = 0` drops an array's
  backing store and the next push reallocates it; in the prototype that cost
  more than a one-effect update itself (278 ns against 53 ns).
- **A node sees the emissions made after it was created.** Each emission is
  numbered, and a node records the number current at its creation; an earlier
  emission reaches it only as the value its parent holds, whether its round has
  propagated yet or not. A subscriber or a `take` made in the batch that wrote
  its source does not count the written value twice. A derived node emits when
  its round recomputes it, so one made in that batch below it sees that
  emission: it read the derived node's value from before the write. A node with
  several parents asks `emittedNow(parent)` for the same reason.
- **A node that is done leaves its parents.** A `take`, `takeWhile` or
  `takeUntil` that will pass nothing more takes itself out of its parents'
  children, keeping its value, so that they neither visit it nor keep it alive.
  It leaves them as a disposed child does, through the same lazy compaction.
- **Equality cut-off by default.** A node that recomputes to an `Object.is`
  equal value does not emit, and nothing below it is visited. `equals` replaces
  the comparison; the event operators pass `() => false`.

## Values

A node holds its value or the `noValue` symbol. There is no `Optional` per
value: reading a value is a field read and a comparison. `InitializedObservable`
is a type for nodes that always hold one; `pipe` works out, from the operator's
type, whether the result does. As in synstate, an operator is one of three
function types, and the kind is in what it takes and returns:
`ProvideInitialValueOperator` (synstate's `WithInitialValueOperator`, renamed to
a verb like the other two) returns an `InitializedObservable`,
`KeepInitialValueOperator` takes and returns one, `DropInitialValueOperator`
takes and returns an `Observable`. An operator typed as a
`ProvideInitialValueOperator` that may return an observable with no value does
not type-check without a cast, which a label beside the function type (an
earlier `InitKind`) let through. The costs are synstate's: a
`KeepInitialValueOperator` called directly takes only an
`InitializedObservable`, and `pipe` applies it to any observable, so its body is
typed as reading a value its source may not hold yet. The built-in ones read
`current` and check for `noValue`.

`pipe` takes one operator, and calls are chained. TypeScript infers an
operator's parameter types (the `x` of `map((x) => …)`) from the previous
operator's output only through overloads of fixed length, so a variadic `pipe`
stops at the last overload; a chain has no limit and three overloads, one per
operator type. A chain builds the same nodes, so it costs nothing at update
time.

## Effects

Subscribers and DOM bindings are effects: leaves of the graph, queued when their
source emits and run after the drain, against a graph that has settled. An
effect never sees a half-propagated graph, and the DOM layer can mount and
dispose inside an effect without being inside a propagation.

A switch (synstate-dom-next's `If`, `Match*`, `For`) disposes a branch in its
effect, after the drain, so the drain would otherwise recompute the branch's
nodes from the value that rules the branch out. It decides in the drain instead:
a node below what it switches on checks the key, and retires the branches that
go (`retireOwner`), which takes their nodes and effects out of the updates
without running any code of the application. The branches are made in an owner
with a depth floor (`ownerBelow`), so that every node of theirs is deeper than
that check and the drain reaches the check first. An owner a node makes for
itself (a `switchMap`'s projection, a `createDerived` setup) takes the floor the
node was made at and is retired with the node. An exception from the check is
not let out into the drain: the switch retires what it could not keep, and its
effect drops it and throws the exception, or the exception is reported when the
update ends if the update ends before the effect runs. An observable a branch is
given rather than makes is not the branch's, and computes from every value.

`subscribe` calls its function once at once, in a batch: a write that call makes
propagates when it returns, as a write by an effect does, rather than calling
the function again from inside itself.

## Writes

- A write made during the drain (inside a `map`, say) is deferred until the
  round's effects have run, and then starts the next round; it does not
  interrupt the update under way. `update(fn)` defers `fn` itself, so two
  updates in one drain both apply.
- A write made by an effect starts the next round. Updates never nest. A program
  that keeps writing to what its own update reaches, from its effects or from
  operators, is stopped after 100 updates in a row with an error naming the
  cause, instead of looping forever.
- `batch(fn)` makes the writes inside `fn` one update. Mounting a UI is a batch,
  so a write made while mounting propagates once the nodes are in place.
- A state written twice before its round propagates once, with the last value,
  even when that is the value the round starts from: its subscribers see it
  again, and a derived node's equality cut-off stops it. Telling the two apart
  would need the value each subscriber last saw.
  An event source is not (`source`, the asynchronous sources and `mergeMap`):
  each value is delivered in a round of its own, in order, and one written by an
  effect before the round's other effects have read the previous value waits
  until they have. A round that delivers a queued value starts the count of the
  limit again, since each one consumes a value written before it. An exception
  from a node drops the queued values with the rest of the queues; one from an
  effect does not.
- Effects and recomputes run with no owner current, so what they create does not
  belong to whichever owner was current when the write was made.
- An effect that throws stops neither the other effects of its round nor the
  rounds after it, so what they write still propagates and one failing binding
  does not leave the rest of the page behind the state. Its exception propagates
  once the flush is done. An exception from a node, the round limit, or an
  effect that throws in a later round as well (one that writes and throws would
  otherwise run until the limit) ends the flush at once. Either way the first
  exception propagates, an effect's held from an earlier round included, and a
  later one is reported.
- An exception thrown by a node empties the queues before it propagates, so the
  next write starts from a clean state.

## Ownership

An owner is the only lifetime. Everything created while an owner's `run`
executes belongs to it; disposing it disposes the child owners, then runs the
cleanups, then disposes the nodes, each newest first. There is no reference
counting and no completion travelling down the graph: a source that ends is
disposed, and what depends on it is disposed with its owner.

A disposed child (an owner, a node in a parent's `children`) is not looked up
and spliced out: it is skipped, and the list is compacted once half of it is
dead. A list of rows that come and go costs no search per row. An owner's own
list of nodes is swept of disposed ones each time it doubles, so a long-lived
owner that subscribes and unsubscribes stays bounded.

Without completion, an operator that follows inner observables still has to know
when one can emit no more. Each node answers `settled`: a source once it is
disposed or its timer, promise or subscription is over, a derived node once it
is gone or every parent is settled and it waits on nothing of its own (a
`debounce` timer, an inner observable). A node whose emission still waits for
its round is not settled. Nothing is pushed down the graph; the question is
asked where the answer is used. `mergeMap` asks when an inner observable is
projected or emits, and lets it go once it is settled and its follower has read
what it emitted. One that settles without emitting is swept once the number
followed doubles, after the round that reached that number has run its effects.

`settled` is on the public type, so a subscriber asks it too, to tell the last
value. That works only where the end comes with a value: a `take` is settled by
the time its subscriber receives its last value, and so is a `takeWhile` with
`inclusive`, which passes the value that ends it. Where the end has no value of
its own (a plain `takeWhile`, a `takeUntil`'s notifier, a subscribable
completing), the producer sends the end as a value, as errors are `Result`s.
Nothing is called when `settled` turns true; that push is what completion cost
every operator.

## One copy per program

A graph cannot span two copies of the package: `toNode` checks `instanceof` and
throws for an observable from another copy. This is what lets a node be a class
with fields rather than an object reached through a symbol.

## Classes

A node is created for every derived value of a UI, so nodes are classes: the
methods live on a prototype, and each operator is a subclass that overrides
`recompute`. The public types are views of the classes (`view` is the one place
a class is given its public type). `synstate-next/internal` exports the classes
for synstate-dom-next and is not for applications.

## Measured

Medians from the prototype (2026-11-06), against synstate at the time:

| case                   | synstate / next |
| :--------------------- | --------------: |
| chain of maps          |           1.8 × |
| diamonds               |           2.3 × |
| equality cut-off       |           3.8 × |
| write with no observer |           3.0 × |
| create and dispose     |           2.4 × |

The DOM layer on top spent 1.5 to 5 times less synchronous JavaScript than
synstate-dom, within 0.6 ms of Solid (creating 1,000 rows: 6.7 ms with
synstate-dom, 2.9 ms with the prototype, 2.6 ms with Solid). These figures are
from the prototype; the packages are to be measured again in
`synstate-dom-benchmark` once they have the features the scenarios use.

## Breaking changes against synstate

- `getSnapshot()` returns the value or `undefined`, not an `Optional`:
  `hasValue` says whether there is one, and an `InitializedObservable` has
  `value` and a `getSnapshot` that returns `A`. `subscribe` returns the function
  that stops it, not a `{ unsubscribe }` object.
- Subscribers run after the update has settled, not during it.
- Nested updates do not exist: a write made during the drain is deferred, and
  one made by an effect propagates in the next round.
- `complete` is gone: an observable ends by being disposed. `subscribe` takes no
  `onComplete`. `settled` takes the place of `isCompleted` and turns true
  sooner: a `take` is settled when its subscriber receives its last value, where
  synstate completed after it (see "Ownership").
- Observables from two copies of the package cannot be combined.
- A `For` row reads its new element one round after the list changed (see
  synstate-dom-next).
- `take(n)` and `skip(n)` count the value the source holds at the start, so
  `state(0).pipe(take(1))` holds `0` and passes nothing more. synstate counted
  only the values after it.
- `takeUntil` and `skipUntil` react to the notifier's emissions after they were
  created; a value the notifier already holds is not one. synstate stopped (or
  started) at once for a notifier that held a value. A value the source emits in
  the update the notifier emits in is dropped by `takeUntil` and passed by
  `skipUntil`.
- `withBufferedFrom` buffers what the other observable emits after it was
  created; synstate put the value it held into the first buffer.
- The operators that are one `map` are gone: `mapTo`, `pluck` and its alias
  `getKey`, `attachIndex` and its alias `withIndex` (a `scan`), `mapOptional`,
  `unwrapOptional`, `mapResultOk`, `mapResultErr`, `unwrapResultOk`,
  `unwrapResultErr`. So are the aliases `withLatestFrom`, `withBuffered`,
  `distinctUntilChanged` (`skipIfNoChange`) and `flatMap` (`mergeMap`). Each
  name is one more thing to learn for no capability; a `map` with
  `equals: () => false` replaces `mapTo` on an event.
- `combine` (and its alias `combineLatest`) is gone: it was `derive` with a `fn`
  that returns its arguments as a tuple, and invited `combine(…).pipe(map(…))`,
  which builds a new tuple on every update only for a second node to take it
  apart; `derive` with the computation as its `fn` is one node and no tuple.
- The predicates of `filter` and `skipWhile` are given the value alone, not its
  index; a `scan` counts.
- A scope is an `Owner`: `createScope` is `createOwner`, `getCurrentScope` is
  `getOwner`, `onScopeDispose` is `onCleanup`.
- Circular dependencies are not detected: a node's parents exist before it, so
  no cycle can be built through the API.
- A node made from a disposed one is settled at once and is not registered with
  it; it holds the value it computed from the last value.
- `timer` and `counter` start when they are created; `startManually` and
  `start()` are gone. Create one where it should start, inside the owner that
  should stop it.
- `fromSubscribable` subscribes with an observer object (`next`, `error`,
  `complete`), the form RxJS recommends and a TC39 `Observable` takes, not with
  three functions.
- `source()` emits with `.emit`, not `.next`.
- The setters of `createState`, `createReducer` and `createBooleanState` return
  nothing. A write made while the graph drains is applied once that round's
  effects have run, so the state it would return is not known yet; `getSnapshot`
  reads it.
- `collectToArray` is gone: it resolved on completion, which no longer exists.
  A node that is done is settled, which is asked rather than announced.
- An operator written outside the package is one `createDerived` (synstate's
  `createSyncChildObservable`, `createAsyncChildObservable` and
  `createInitializedSyncChildObservable`), and a source is one `createSource`
  (`createRootObservable`). They take no update token: `ctx.emitted(parent)`
  says which parent woke the update, `ctx.set` passes a value on in it and
  `ctx.emit` in an update of its own. A `settled` handler replaces
  `canEmitNoMore`, and `flush` is gone with completion. The setup runs with the
  observable as its owner: what it creates belongs to the observable, and its
  cleanups run newest first, before what it created is disposed, as an owner's
  do; synstate ran them in the order registered. The `isChildObservable`,
  `isManagerObservable` and `isRootObservable` guards are gone: the kinds they
  told apart are not in the public types.
- A source that is done (a `timer` that fired, a `fromPromise` that resolved, a
  `fromSubscribable` whose subscribable completed) is settled, not completed:
  it keeps its value and its subscribers until its owner disposes it.
- The public types follow; what stays, what is renamed and what is gone is
  listed on the docs site's changes page
  (`apps/synstate-next-docs/src/content/docs/background/changes-from-synstate.md`).

## Tests

synstate's tests are ported under `test/ported/`, and synstate-dom's under
synstate-dom-next's; each README lists each file and where it went.
