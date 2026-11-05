# synstate-dom

## 0.8.0

### Minor Changes

- c8ab3c9: `autocorrect={false}` and `async={false}` now take effect. Both were written as attributes, and `false` removed the attribute: `autocorrect` then stayed on, since its `false` is the value `off` rather than an absence, and a script made by the binding stayed async, since `createElement` makes it so until the property says otherwise. Both are now written as DOM properties, as `spellcheck` and `draggable` are.

    Breaking: an observable bound to either takes `boolean` and no longer `undefined`, which used to remove the attribute and so left both on; write `true` for that. As with `spellcheck`, an `autocorrect` bound on a control always says its own value, rather than following its form's.

### Patch Changes

- Updated dependencies [36ffebb]
- Updated dependencies [23bfcbe]
    - ts-data-forge@14.11.1
    - ts-type-forge@9.2.3
    - synstate@7.0.1

## 0.7.1

### Patch Changes

- 6c4fd99: A boolean on an `aria-*` attribute is written as `"true"` or `"false"`, as React does, instead of as an empty attribute, which `aria-*` reads as its default: `aria-busy={pending$}` now says what it means. `aria-*` props are typed `Bindable<boolean | number | string | undefined>`.
- 6f059fc: `For`, `If`, `MatchOptional` and `MatchResult` follow a write from inside the row or branch they are mounting: a branch that writes the value that chose it, on its first mount or on a later switch, now leaves the branch for the latest value with one live scope, and a `For` row that writes `items` while it is mounted no longer leaves its key in two rows or the write unapplied.

    A row or branch that keeps writing a value that chooses another one, so that the writes never settle, is an error after 100 of them.

- Updated dependencies [809aa3c]
    - synstate@7.0.1
    - ts-data-forge@14.11.0

## 0.7.0

### Minor Changes

- e894e11: `switchMap` and `mergeMap` (and `flatMap`, its alias) project the value their source already holds when they are created, as `map` and `filter` start from it. Before, they projected only the values the source emitted afterwards, so a pipeline built on a state or on an observable with an initial value did nothing until the source next changed: `pageId.pipe(switchMap(fetchPage))` on a state never fetched the page an application opened on.

    A completed source is still not projected. A pipeline that relied on the drop now sees one more value at the start. That projection runs inside `pipe()`, whether or not anything subscribes: a pipeline built at module level starts its first request when the module is imported, and a projection that throws on the held value now throws from `pipe()` rather than on a later update. `skipWhile((_, index) => index === -1)` before the operator, which drops only the held value, keeps the old behavior.

    synstate-react-hooks, synstate-react-hooks-compat, synstate-preact-hooks and synstate-preact-signals re-export both operators, so the change reaches their consumers too.

    synstate-dom takes synstate as a peer dependency, so its release moves that range to the new synstate: a `switchMap` or `mergeMap` that a synstate-dom application builds on a state now projects the state's current value when the component runs.

### Patch Changes

- a8a5746: fix(synstate-dom): `For` and `If` follow an update made before they are attached

    A later sibling that writes to what an earlier `For`, `If`, `MatchOptional` or `MatchResult` reads, while the enclosing element (or `render`) is still mounting, no longer leaves the old rows or branch on the page. `For` no longer builds its kept rows a second time without disposing the first ones. The update is applied once the nodes are inserted.

    `render` now disposes and removes what it mounted when mounting throws, rather than leaving it in the container with no function to unmount it.

- Updated dependencies [e9420e9]
- Updated dependencies [a48864f]
- Updated dependencies [e894e11]
- Updated dependencies [3b3064f]
- Updated dependencies [c4bc5ef]
- Updated dependencies [1f78470]
- Updated dependencies [d567a6a]
    - ts-data-forge@14.11.0
    - synstate@7.0.0

## 0.6.0

### Minor Changes

- 2e2c974: A type-level break, released as a minor while synstate-dom is 0.x: the element props no longer accept writable DOM properties that have no attribute (`selectedIndex`, `valueAsNumber`, `selectionStart`, `currentTime`, `volume`, `playbackRate`, the URL parts of `<a>` such as `hash`, the obsolete `ch` and `chOff`, and others). The binding wrote them with `setAttribute`, which changed nothing. `defaultMuted`, `defaultSelected` and `encoding` are now written as their attributes `muted`, `selected` and `enctype`.
- bd9e8c0: synstate-dom exports `isImeKeyDown(event)`, whether a key down belongs to an input method: one sent while a composition is going on, or the Enter or Escape that Safari sends with key code 229 after `compositionend`. blueprint-synstate's `NumericInput`, `TimePicker` and `DateInput` use it in place of their own copy, so blueprint-synstate needs a synstate-dom that exports it.

### Patch Changes

- Updated dependencies [eb65772]
- Updated dependencies [5618786]
- Updated dependencies [c53c17d]
- Updated dependencies [86c41cb]
- Updated dependencies [b7a2d57]
- Updated dependencies [a5235cf]
- Updated dependencies [766b6fd]
    - ts-data-forge@14.10.2
    - synstate@6.2.1

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
