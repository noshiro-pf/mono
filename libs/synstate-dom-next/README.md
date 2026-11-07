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
- A controlled `checked` or `indeterminate` is restored in the next animation
  frame or a task after the `change`, whichever comes first, so it is restored
  in a hidden page too.

## Not yet built

The port of synstate-dom's tests. It lands in a pull request of the rebuild.
