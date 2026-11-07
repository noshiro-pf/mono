# synstate-dom-next

A from-scratch rebuild of [synstate-dom](../synstate-dom/README.md) on
[synstate-next](../synstate-next/README.md), kept as a separate private package
until it matches or beats synstate-dom, then released as its next major version.
It is not published.

## Who changes this package

Only the rebuild's own pull requests change this package and synstate-next;
fixes made to synstate-dom are not ported here. The rule and its reason are in
[synstate-next's README](../synstate-next/README.md#who-changes-this-package)
(日本語も同じ節にあります).

## What it does differently

- **A binding is one effect.** Each text, attribute, property, class or style
  binding is an instance of an effect class holding its target in its own
  fields, rather than a subscriber, a closure and a cleanup.
- **Bindings run after the update has settled.** `If` and `For` mount and
  dispose in the effect phase, outside any propagation.
- **Mounting is a batch.** A write made while mounting propagates once the nodes
  are in the document, so nothing waits for an element to be attached.
- **`For` keeps a state per row** and sets it when the row's element changes;
  rows whose element did not change are not visited, and a list whose keys kept
  their order skips the keyed diff. The writes start a round of their own, so a
  row reads its new element one round after the list changed, before anything is
  painted.
- **`selector(source).is(key)`** writes only the observables of the old and the
  new key, however many rows watch it.
- **Event handlers are `on…` properties** where the element has one, and a
  listener otherwise; neither is removed, since the element goes with its owner.

- **`If`, `MatchOptional` and `MatchResult` are one keyed switch.** A branch is
  mounted for the key of the value (the condition, `isSome`, `isOk`) and kept
  while the key stays; what the branch is given follows the value meanwhile.

The data slots keep synstate-dom's rule: they take a `Bindable` (an
`InitializedObservable` or a `constant(…)`), never a plain value.

## Changes from synstate-dom

- `subscribeInScope` is gone: a `subscribe` made while an owner runs belongs to
  that owner already, and is disposed with it.
- `inlineMap` is not rebuilt; synstate-dom is removing it.
- An element's namespace follows where it is mounted, not its tag: inside an
  `<svg>`, down to a `<foreignObject>`, `<a>` and `<title>` are SVG elements.
  synstate-dom makes them HTML wherever they are. Their props are still typed as
  HTML's, a `ref` included, since a JSX element's type cannot depend on where it
  stands.
- A switch (`If`, `MatchOptional`, `MatchResult`) bound to an observable is
  marked by a comment at each end, where synstate-dom puts one after it. One
  given a constant mounts its branch with no comment.
- A `For` row's or a branch's cleanup that throws stops neither the update nor
  the other disposals: the rows and branches are replaced, and the exception is
  thrown once they are in place. A row that throws while mounting takes out the
  rows its update made and keeps the others; a branch that throws leaves its
  switch empty until the next value. A binding that throws does not stop the
  other bindings of its update either (synstate-next's DESIGN.md,
  "Propagation").
- A controlled `checked` or `indeterminate` is restored in the next animation
  frame or a task after the `change`, whichever comes first, so it is restored
  in a hidden page too.

## Benchmark

`apps/synstate-dom-benchmark`'s `pnpm run benchmark:next` compares this package
with synstate-dom and Solid, and writes
[RESULTS-NEXT.md](../../apps/synstate-dom-benchmark/RESULTS-NEXT.md).

## Tests

synstate-dom's tests are ported under `test/ported/` and `test/browser/ported/`;
[test/ported/README.md](test/ported/README.md) lists each file and where it
went.
