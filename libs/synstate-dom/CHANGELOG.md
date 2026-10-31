# synstate-dom

## 0.5.0

### Minor Changes

- eb1a160: A bound `checked` or `indeterminate` of an `<input>` is controlled. After a `change`, synstate-dom draws the input as its bound values again, before the next frame is painted, so a toggle the owner does not take in `onChange` no longer stays on screen. A change to a radio button sets back every bound button of its group, since the browser unchecks the others without an event. Every handler of the event, a delegated one on an ancestor included, still sees the user's change. For a checkbox the user toggles freely, use `defaultChecked`. `value` is not written back.

    blueprint-synstate's `Checkbox` and `Radio` now stay as their `checked` when the owner refuses a change, and `RadioGroup` drops its own workaround for the same thing. blueprint-synstate now needs synstate-dom 0.5.0 or later.

- 6e60c42: synstate-dom exports `subscribeInScope`, `listenInScope` and `createAfterUpdate`, what a component, called once, does in place of an effect: a subscription or an event listener that lasts until the current scope is disposed, and work run in a microtask once the update under way has finished. blueprint-synstate uses them instead of its own copies, and needs a synstate-dom that exports them.

### Patch Changes

- Updated dependencies [ad2df6c]
    - ts-data-forge@14.10.1
    - synstate@6.1.1

## 0.4.0

### Minor Changes

- 388a021: Add `derive(parents, (a, b) => …, { equals })`, which derives one value from the latest values of several observables as a single observable. It calls the projection with the parents' values as arguments, emits once every parent has a value and then whenever one of them emits, and stops a result `Object.is` the one it holds unless `equals` says otherwise. `combine(parents).pipe(map(fn))` emits the same values with two observables and a tuple built on every update; `derive` builds none. `combine` keeps emitting the tuple, now through `derive`, which makes `combine(...).pipe(map(...))` faster too. synstate-react-hooks, synstate-react-hooks-compat, synstate-preact-hooks and synstate-preact-signals re-export `derive`.

    synstate-dom's `derive` now builds on it, so a value derived from several bindables is one observable, and blueprint-synstate's components use it in place of `combine` + `map`. Both now need synstate 6.1.0 or later.

### Patch Changes

- Updated dependencies [388a021]
    - synstate@6.1.0

## 0.3.0

### Minor Changes

- ddbb770: `derive`, `view` and `mapBindable` pass on a result only when it differs from the one held (`Object.is`), because synstate's `map`, which they are built on, now does: a derived value that did not change writes nothing to the DOM.

### Patch Changes

- Updated dependencies [ddbb770]
    - synstate@6.0.0

## 0.2.0

### Minor Changes

- 5139149: `For` makes a row's `index$` only when `children` declares a second parameter, as Solid's `For` does, so a row that does not take its position creates and updates one node fewer. A `children` that reads the index through a rest parameter or `arguments` is now given `undefined`. An update that keeps every key in its place skips the reordering, and one that keeps no key removes the old rows' nodes in one `Range` instead of one by one.

### Patch Changes

- Updated dependencies [5e9b2c6]
    - synstate@5.0.1
    - ts-data-forge@14.10.0
