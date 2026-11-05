# blueprint-synstate

[Blueprint](https://blueprintjs.com/)'s components rebuilt on [synstate-dom](../synstate-dom), in Blueprint's own markup, so that Blueprint's style sheets draw them and none of its JavaScript — React, react-day-picker, date-fns — is loaded.

> [!WARNING]
> Not published: it depends on synstate-dom, which is not published yet.

## Usage

Import Blueprint's style sheets as a Blueprint app does; the components here need `@blueprintjs/core`'s, and the date pickers `@blueprintjs/datetime`'s too:

```css
@import '@blueprintjs/core/lib/css/blueprint.css';
@import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
```

A date and time to the minute, with the calendar in Japanese:

```tsx
import { DateInput } from 'blueprint-synstate';
import { createState } from 'synstate';
import { render } from 'synstate-dom';

// `YYYY-MM-DDTHH:mm`, as `<input type="datetime-local">` holds it; '' for none.
const [due$, setDue] = createState('');

const unmount = render(
    () => (
        <DateInput
            clearButtonText={'クリア'}
            locale={'ja'}
            placeholder={'日時を選ぶ'}
            showActionsBar
            timePickerProps={{ showArrowButtons: true }}
            timePrecision={'minute'}
            todayButtonText={'今日'}
            value={due$}
            onChange={setDue}
        />
    ),
    document.body,
);

// Later: closes the calendar if it is open, and removes everything.
unmount();
```

## What is implemented

| Component          | Blueprint's             | Notes                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :----------------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Alert`            | `Alert`                 | Icons from the 20px set only, at 40px.                                                                                                                                                                                                                                                                                                                                                                                  |
| `AnchorButton`     | `AnchorButton`          | Disabled or loading, it has no `href` and leaves the tab order.                                                                                                                                                                                                                                                                                                                                                         |
| `BpText`           | `Text`                  | Named apart from the DOM's `Text`. With `ellipsize`, its `title` is the whole text while it is cut short, measured again as the text or its size changes.                                                                                                                                                                                                                                                               |
| `Button`           | `Button`                | `variant` may change after mount; `loading` disables it and draws the spinner.                                                                                                                                                                                                                                                                                                                                          |
| `ButtonGroup`      | `ButtonGroup`           |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Callout`          | `Callout`               | The icon defaults to the intent's, as Blueprint's does.                                                                                                                                                                                                                                                                                                                                                                 |
| `Card`             | `Card`                  |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Checkbox`         | `Checkbox`              | No indeterminate state.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `Collapse`         | `Collapse`              | The same 200ms slide, through the same inline heights and transforms, from the body's height as the closing starts. No `transitionDuration` or `component`.                                                                                                                                                                                                                                                             |
| `ControlGroup`     | `ControlGroup`          |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `createToaster`    | `OverlayToaster.create` | Synchronous, drawn in place at the end of its container, which it joins with the first toast rather than as it is made; no `action`, `autoFocus` or `usePortal`. Each toast animates itself, where Blueprint 6.21 moves every toast's transition classes onto the one mounted last (its toasts share one ref), so that dismissing one there fades out the newest. A toast replaced by its key draws its content afresh. |
| `DateInput`        | `DateInput`             | The popover is drawn in place, positioned `fixed`, as `usePortal: false` and `positioningStrategy: 'fixed'`.                                                                                                                                                                                                                                                                                                            |
| `DatePicker`       | `DatePicker`            | react-day-picker's markup and keyboard navigation; month and weekday names from `Intl`. `shortcuts` takes a list only, not `true` for Blueprint's own.                                                                                                                                                                                                                                                                  |
| `DateRangeInput`   | `DateRangeInput`        | One month (`singleMonthOnly`), no shortcuts or time, a controlled value of days. The popover is drawn in place, as `DateInput`'s. Escape in the calendar gives the focus back to the field without opening it again. Enter on text that reads as no date changes nothing, where Blueprint's passes on an invalid `Date`.                                                                                                |
| `DateRangePicker`  | `DateRangePicker`       | One month (`singleMonthOnly`), no shortcuts or time; the hovered range drawn as Blueprint draws it.                                                                                                                                                                                                                                                                                                                     |
| `Dialog`           | `Dialog`                | In a portal at the end of the body. Focus goes first to an element with `autoFocus`; the backdrop and Escape close it where they may. Always `lazy`, as Blueprint's default; no `usePortal` or `onOpened`-style callbacks.                                                                                                                                                                                              |
| `FileInput`        | `FileInput`             |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `FormGroup`        | `FormGroup`             | The helper text is drawn only while it is not empty; the intent may change after mount.                                                                                                                                                                                                                                                                                                                                 |
| `HtmlSelect`       | `HTMLSelect`            | The wrapper is a `<span>`, so that it may sit inside a `<label>`.                                                                                                                                                                                                                                                                                                                                                       |
| `HtmlTable`        | `HTMLTable`             |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Icon`             | `Icon` (SVG)            | The few icons the components above draw, and those an app built on them has needed; a few at 20px (`IconSize.LARGE`) and up too.                                                                                                                                                                                                                                                                                        |
| `InputGroup`       | `InputGroup`            | A `leftIcon` and a `rightElement`, the input padded by its width. `onChange` is the DOM's `change`; `onInput` every keystroke.                                                                                                                                                                                                                                                                                          |
| `Label`            | `Label`                 | Wraps its control, so that the control needs no `id`.                                                                                                                                                                                                                                                                                                                                                                   |
| `Menu`             | `Menu`                  |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `MenuItem`         | `MenuItem`              | Its text cut short, with a `title`, where it does not fit; with `children`, a submenu opens beside it while hovered. No `href` or `roleStructure`.                                                                                                                                                                                                                                                                      |
| `Navbar`           | `Navbar`                |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `NavbarGroup`      | `NavbarGroup`           |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `NonIdealState`    | `NonIdealState`         | Icons from the 20px set only.                                                                                                                                                                                                                                                                                                                                                                                           |
| `NumericInput`     | `NumericInput`          | For a number value; see [Numeric input](#numeric-input).                                                                                                                                                                                                                                                                                                                                                                |
| `NumericInputView` | `NumericInput`          | Its markup alone, with the text as its value; see [Numeric input](#numeric-input).                                                                                                                                                                                                                                                                                                                                      |
| `Popover`          | `PopoverNext`           | Placed by Floating UI with Blueprint's middleware; opened by a click or by hovering, or as `isOpen` is, asking through `onInteraction` and `onClose`. The target's element is decorated once drawn, not cloned, so a target whose own `active` turns on while it is open loses `bp6-active` as it closes.                                                                                                               |
| `Radio`            | `Radio`                 |                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `RadioGroup`       | `RadioGroup`            | As a `radiogroup`, labelled by its `label`.                                                                                                                                                                                                                                                                                                                                                                             |
| `RangeSlider`      | `RangeSlider`           | Horizontal only. A handle stops at the other, as Blueprint's lock; a press on the track drags the nearest. The track is measured as a handle moves, and a handle again as its size changes, where Blueprint measures on render. As Blueprint's, a tap also arrives as the browser's compatibility mouse events, so its `onRelease` may come twice, with the same range.                                                 |
| `SegmentedControl` | `SegmentedControl`      | As a `radiogroup`.                                                                                                                                                                                                                                                                                                                                                                                                      |
| `Spinner`          | `Spinner`               | With no value, as an indeterminate progress bar.                                                                                                                                                                                                                                                                                                                                                                        |
| `Switch`           | `Switch`                | No inner labels.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Tabs`             | `Tabs`                  | As `renderActiveTabPanelOnly`, without `animate`. A tab with no `panel` is a title alone, with no `aria-controls` or `aria-expanded`.                                                                                                                                                                                                                                                                                   |
| `Tag`              | `Tag`                   | Not interactive: no `onClick` or `interactive`. `active` draws it as chosen, which Blueprint does only for an interactive tag.                                                                                                                                                                                                                                                                                          |
| `TagInput`         | `TagInput`              | At its medium size. Each value says how its tag is drawn, in place of `tagProps`; the input is uncontrolled, and is cleared as values are added. Unlike Blueprint 6, whose tags are not interactive and so ignore `active`, it draws the tag the arrow keys moved to.                                                                                                                                                   |
| `TextArea`         | `TextArea`              | `autoResize` fits the text on mount, on input and on a new `value`, as Blueprint's; not when only the width changes.                                                                                                                                                                                                                                                                                                    |
| `TimePicker`       | `TimePicker`            | To the minute, on a 24-hour clock.                                                                                                                                                                                                                                                                                                                                                                                      |
| `Tooltip`          | `Tooltip`               | Opens while the target is hovered or has focus; Escape hides it.                                                                                                                                                                                                                                                                                                                                                        |

Values are strings, as the browser's own inputs hold them: `YYYY-MM-DD` for a date, `YYYY-MM-DDTHH:mm` for a date with a `timePrecision`, `HH:mm` for a time, and `''` for none. They are wall-clock times with no time zone, so no time zone is offered.

Behavior follows Blueprint's with a controlled value, including what may surprise: changing the month moves a selected date to the same day in that month, and the default range is from 1 January 20 years ago to six months from today. Where it differs:

- Escape while the calendar is open is kept from the page, so that a `<dialog>` the input is in stays open until the next Escape.
- What assistive technology reads out is set by `labels` and `timePickerProps.labels`, in place of react-day-picker's `labels` functions.
- No shortcuts, range pickers, time zones, 12-hour clock or seconds.

## Numeric input

A numeric input is built in two layers, as every numeric input in this repository is (see [`articles/numeric-input-interface.md`](../../articles/numeric-input-interface.md)):

- `NumericInputView` is stateless and controlled, and its value is the **text**: it shows `value` and hands every keystroke to `onValueChange` as a string.
- `NumericInput` holds that text, uncontrolled while the user types, and makes it the value only when it is committed — on blur, on Enter, or by a step of the buttons or the arrow keys, which repeats while held and stops at a bound. Then what `decode` reads is clamped to `min` and `max`, `normalize` makes a value of it, the text is rewritten from the value, and `onValueChange` is told if it changed. The same `min` and `max` are read out as the spin button's bounds, so the bound that is announced is the one that is enforced. Each step button is disabled while the text is at or past the bound it steps toward, as Blueprint's is. `decode` is also read whenever the text changes, for the number the spin button reads out and for those buttons, so it takes half-typed text without throwing; empty text is no number and is not given to it.

Never give a numeric input a number as its controlled value: what the user is half way through typing, such as `-`, `3.` or `1e`, would collapse into `NaN` or a rounded number on the next keystroke. A value that is not a plain number, such as one that may be empty, is held by a layer of its own on top of `NumericInputView`.

```tsx
import { NumericInput } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, render } from 'synstate-dom';

// The value is a number; what the user is typing stays text until committed.
const [rate$, setRate] = createState(1.5);

// The bounds a committed number is clamped to before `normalize`, which are
// also read out as the spin button's.
const minRate = 0;

const maxRate = 20;

const unmount = render(
    () => (
        <NumericInput
            // `NaN` for text that is not a number, which `normalize` replaces.
            decode={Number.parseFloat}
            encode={(rate) => rate.toFixed(2)}
            max={constant(maxRate)}
            min={constant(minRate)}
            // Given a number already in the bounds, which are on its 0.01 grid, or
            // `NaN`.
            normalize={(rate) =>
                Number.isNaN(rate) ? minRate : Math.round(rate * 100) / 100
            }
            step={0.05}
            value={rate$}
            onValueChange={setRate}
        />
    ),
    document.body,
);

unmount();
```
