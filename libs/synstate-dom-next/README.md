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

The data slots keep synstate-dom's rule: they take a `Bindable` (an
`InitializedObservable` or a `constant(…)`), never a plain value.

## Not yet built

SVG elements, `Portal`, `Match`, the controlled `checked` and `indeterminate` of
synstate-dom, and the port of synstate-dom's tests. Each lands in a pull request
of the rebuild.
