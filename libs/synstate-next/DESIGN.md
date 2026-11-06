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
- **Equality cut-off by default.** A node that recomputes to an `Object.is`
  equal value does not emit, and nothing below it is visited. `equals` replaces
  the comparison; `combine` and the event operators pass `() => false`.

## Values

A node holds its value or the `noValue` symbol. There is no `Optional` per
value: reading a value is a field read and a comparison. `InitializedObservable`
is a type for nodes that always hold one; `pipe` works out, from each operator's
`InitKind` (`keep`, `drop`, `with`), whether the result does.

## Effects

Subscribers and DOM bindings are effects: leaves of the graph, queued when their
source emits and run after the drain, against a graph that has settled. An
effect never sees a half-propagated graph, and the DOM layer can mount and
dispose inside an effect without being inside a propagation.

## Writes

- A write made during the drain (inside a `map`, say) is deferred until the
  drain ends; it does not interrupt the update under way. `update(fn)` defers
  `fn` itself, so two updates in one drain both apply.
- A write made by an effect starts the next round. Updates never nest. A program
  that keeps writing from its effects is stopped after 100 rounds with an error
  naming the cause, instead of looping forever.
- `batch(fn)` makes the writes inside `fn` one update. Mounting a UI is a batch,
  so a write made while mounting propagates once the nodes are in place.
- A state written twice before its round propagates once, with the last value.
  An event source is not: each `next` is delivered in a round of its own, in
  order. A round that delivers a queued value starts the count of the limit
  again, since each one consumes a value written before it. An exception drops
  the queued values with the rest of the queues.
- Effects and recomputes run with no owner current, so what they create does not
  belong to whichever owner was current when the write was made.
- An exception thrown by a node or an effect empties the queues before it
  propagates, so the next write starts from a clean state.

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

- Subscribers run after the update has settled, not during it.
- Writes made during propagation are deferred; nested updates do not exist.
- `complete` is gone: an observable ends by being disposed.
- Observables from two copies of the package cannot be combined.
- A `For` row reads its new element one round after the list changed (see
  synstate-dom-next).

## Not yet built

The operators beyond `map`, `filter`, `scan`, `withInitialValue`, `derive`,
`combine`, `merge`, `debounce` and `switchMap`; the remaining sources (timers,
promises, `fromEvent`); and the port of synstate's tests. Each lands in a pull
request of the rebuild.
