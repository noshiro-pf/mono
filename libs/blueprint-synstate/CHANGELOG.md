# blueprint-synstate

## 0.7.0

### Minor Changes

- 32680ca: `Collapse`, Blueprint's sliding region, with `keepChildrenMounted`. `Icon` draws `eye-open` and `eye-off` at 20px (`size={20}`, Blueprint's `IconSize.LARGE`), and `double-chevron-up`, `double-chevron-down`, `eye-open` and `eye-off` at 16px; its `icon`, and a `Button`'s `icon` and `endIcon`, may be a name that changes. `Button` passes `aria-controls` and `aria-expanded` on.
- 2fc0052: `NumericInput` disables its up button while the text is at or past `max`, and its down button at or past `min`, as Blueprint's does. `NumericInputView` takes them as the new `incrementDisabled` and `decrementDisabled`, and a disabled step button now has `bp6-disabled`, as Blueprint draws it.

    A bound that moves onto the button being held stops its repeat, and the number read out follows the bounds as they move. Empty text is taken as no number, whatever `decode` returns for it: blur, Enter or a step from it commits from `normalize(NaN)`, where a `decode` such as `Number` used to make it 0. A disabled `NumericInputView` gives its input `aria-disabled`, as Blueprint's does.

### Patch Changes

- Updated dependencies [36ffebb]
- Updated dependencies [23bfcbe]
- Updated dependencies [c8ab3c9]
    - ts-data-forge@14.11.1
    - ts-type-forge@9.2.3
    - synstate-dom@0.8.0
    - synstate@7.0.1

## 0.6.0

### Minor Changes

- 754f7a0: `Navbar` and `NavbarGroup`, Blueprint's bar at the top of a page. A `Tabs` tab may leave out its `panel`, and is then a title alone, as in a navbar whose content is drawn below it. `InputGroup` takes a `leftIcon`, and the `sort` and `filter-list` icons are drawn.

### Patch Changes

- 6c94060: `Tabs` ignores a key down that belongs to an input method (`isImeKeyDown`), as the library's text fields already do, so an Enter that confirms a conversion does not choose a tab.
- Updated dependencies [6c4fd99]
- Updated dependencies [6f059fc]
- Updated dependencies [809aa3c]
    - synstate-dom@0.7.1
    - synstate@7.0.1
    - ts-data-forge@14.11.0

## 0.5.0

### Minor Changes

- 96cf3cb: `NumericInput` clamps a committed number to its `min` and `max` before `normalize`, and a step stops at them, so one pair of bounds is both what is enforced and what assistive technology reads out. `normalize` no longer needs its own clamp; it is given `NaN` as it is.

    A caller that passed `min` and `max` only for the readout, and let `normalize` commit numbers past them, now has those numbers clamped.

### Patch Changes

- bd9e8c0: synstate-dom exports `isImeKeyDown(event)`, whether a key down belongs to an input method: one sent while a composition is going on, or the Enter or Escape that Safari sends with key code 229 after `compositionend`. blueprint-synstate's `NumericInput`, `TimePicker` and `DateInput` use it in place of their own copy, so blueprint-synstate needs a synstate-dom that exports it.
- Updated dependencies [eb65772]
- Updated dependencies [5618786]
- Updated dependencies [c53c17d]
- Updated dependencies [86c41cb]
- Updated dependencies [b7a2d57]
- Updated dependencies [a5235cf]
- Updated dependencies [766b6fd]
- Updated dependencies [2e2c974]
- Updated dependencies [bd9e8c0]
    - ts-data-forge@14.10.2
    - synstate@6.2.1
    - synstate-dom@0.6.0

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
