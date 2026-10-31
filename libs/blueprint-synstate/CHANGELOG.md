# blueprint-synstate

## 0.4.0

### Minor Changes

- 9ae315c: Markup now matches Blueprint React's where a test compares the two:

    - `NumericInput` and `NumericInputView` carry the ARIA Blueprint's do: `role="group"` on the wrapper, `role="spinbutton"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow` on the input, and `aria-controls` on the buttons. `NumericInputView` takes `min`, `max` and `aria-valuenow` for them, and `NumericInput` reads out the number its text shows as it is typed, as Blueprint's does, so its `decode` is now read whenever the text changes and has to take half-typed text without throwing; the inner input group no longer carries `bp6-fill`.
    - `TimePicker` draws its arrow rows without `showArrowButtons` too, empty, as Blueprint's does.
    - `DatePicker`'s grid is labelled by its caption.

    `TimePicker`, `DateInput` and `NumericInput` ignore the keys that pick, confirm or cancel what an input method is composing, Safari's after `compositionend` included.

- eb1a160: A bound `checked` or `indeterminate` of an `<input>` is controlled. After a `change`, synstate-dom draws the input as its bound values again, before the next frame is painted, so a toggle the owner does not take in `onChange` no longer stays on screen. A change to a radio button sets back every bound button of its group, since the browser unchecks the others without an event. Every handler of the event, a delegated one on an ancestor included, still sees the user's change. For a checkbox the user toggles freely, use `defaultChecked`. `value` is not written back.

    blueprint-synstate's `Checkbox` and `Radio` now stay as their `checked` when the owner refuses a change, and `RadioGroup` drops its own workaround for the same thing. blueprint-synstate now needs synstate-dom 0.5.0 or later.

### Patch Changes

- 6e60c42: synstate-dom exports `subscribeInScope`, `listenInScope` and `createAfterUpdate`, what a component, called once, does in place of an effect: a subscription or an event listener that lasts until the current scope is disposed, and work run in a microtask once the update under way has finished. blueprint-synstate uses them instead of its own copies, and needs a synstate-dom that exports them.
- Updated dependencies [ad2df6c]
- Updated dependencies [eb1a160]
- Updated dependencies [6e60c42]
    - ts-data-forge@14.10.1
    - synstate-dom@0.5.0
    - synstate@6.1.1

## 0.3.0

### Minor Changes

- 245a68d: Add `Radio`, `RadioGroup`, `Spinner`, `NumericInputView` and `NumericInput`. A numeric input is built in two layers: `NumericInputView` is stateless and takes the text as its controlled value, and `NumericInput` holds that text while the user types and decodes it into a number only when it is committed (on blur, on Enter, or by a step). `Checkbox` now marks its native input `bp6-control-input`, which Blueprint 6's style sheet hides; without it the browser's own box was drawn beside Blueprint's.

### Patch Changes

- synstate@6.1.1
    - synstate-dom@0.4.0
    - ts-data-forge@14.10.0

## 0.2.0

### Minor Changes

- 388a021: Add `derive(parents, (a, b) => …, { equals })`, which derives one value from the latest values of several observables as a single observable. It calls the projection with the parents' values as arguments, emits once every parent has a value and then whenever one of them emits, and stops a result `Object.is` the one it holds unless `equals` says otherwise. `combine(parents).pipe(map(fn))` emits the same values with two observables and a tuple built on every update; `derive` builds none. `combine` keeps emitting the tuple, now through `derive`, which makes `combine(...).pipe(map(...))` faster too. synstate-react-hooks, synstate-react-hooks-compat, synstate-preact-hooks and synstate-preact-signals re-export `derive`.

    synstate-dom's `derive` now builds on it, so a value derived from several bindables is one observable, and blueprint-synstate's components use it in place of `combine` + `map`. Both now need synstate 6.1.0 or later.

### Patch Changes

- Updated dependencies [388a021]
    - synstate@6.1.0
    - synstate-dom@0.4.0

## 0.1.1

### Patch Changes

- aa96a22: `daysInMonth`, `addDays` and `dayOfWeek` take a year below 100 as written.
  They used to build their `Date` with `new Date(year, monthIndex, day)`, which
  reads a year from 0 to 99 as 1900 to 1999, so `daysInMonth(0, 2)` said 28
  where year 0 has 29. The calendar names (`calendarNames`) are unchanged.
- synstate@6.0.0
    - synstate-dom@0.3.0
    - ts-data-forge@14.10.0
