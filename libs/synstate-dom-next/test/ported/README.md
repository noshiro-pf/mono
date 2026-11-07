# Tests ported from synstate-dom

Every test file of `libs/synstate-dom` is listed here with the file that ports
it, or the reason it was not ported. The differences behind every changed
expectation are in [the README](../../README.md), under "Changes from
synstate-dom".

## Ported

`libs/synstate-dom/src/`:

- `constant/constant`, `constant/to-observable`, `constant/map-bindable`,
  `constant/derive-bindable`, `keyboard/is-ime-key-down`, and the
  `createAfterUpdate` and `listenInScope` cases of `scope/scope-effects`:
  `helpers.test.mts`. A completed observable is a settled one here.
- `control/longest-increasing-subsequence`: the in-source tests of
  `src/control/longest-increasing-run.mts`.
- `jsx/element-props`: `src/jsx/element-props.test.mts`.

`libs/synstate-dom/test/browser/`: each file is ported under the same name in
`test/browser/ported/`, with these changes.

- `inlineMap(x, f)` is `x.pipe(map(f))`; `map` has the same equality cut-off.
- `bindings`: an event handler stays on its element after unmounting, which goes
  with its owner.
- `control`, `for`: a switch bound to an observable has a comment at each end;
  one given a constant has none.
- `render`: a completed observable is a disposed one.
- `pre-attach`: the error for an update that never settles is the scheduler's.
- `reflected-keys`: `reflected-keys.generated.mts` is written by this package's
  `gen:reflected-keys`, from its own props types.
- `samples`: the README samples are written into the test, since this package's
  README has none yet.

## Not ported

- `constant/inline-map`: `inlineMap` is not rebuilt.
- The `subscribeInScope` case of `scope/scope-effects`: `subscribeInScope` is
  gone, since a `subscribe` belongs to the current owner already.
