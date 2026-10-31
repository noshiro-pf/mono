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

| Component          | Blueprint's        | Notes                                                                                                        |
| :----------------- | :----------------- | :----------------------------------------------------------------------------------------------------------- |
| `Button`           | `Button`           | `variant` may change after mount; no `loading` spinner.                                                      |
| `ButtonGroup`      | `ButtonGroup`      |                                                                                                              |
| `Callout`          | `Callout`          | The icon defaults to the intent's, as Blueprint's does.                                                      |
| `Card`             | `Card`             |                                                                                                              |
| `Checkbox`         | `Checkbox`         | No indeterminate state.                                                                                      |
| `DateInput`        | `DateInput`        | The popover is drawn in place, positioned `fixed`, as `usePortal: false` and `positioningStrategy: 'fixed'`. |
| `DatePicker`       | `DatePicker`       | react-day-picker's markup and keyboard navigation; month and weekday names from `Intl`.                      |
| `FileInput`        | `FileInput`        |                                                                                                              |
| `HtmlSelect`       | `HTMLSelect`       | The wrapper is a `<span>`, so that it may sit inside a `<label>`.                                            |
| `HtmlTable`        | `HTMLTable`        |                                                                                                              |
| `Icon`             | `Icon` (16px SVG)  | The few icons the components above draw, and those an app built on them has needed.                          |
| `InputGroup`       | `InputGroup`       | No elements beside the input. `onChange` is the DOM's `change`; `onInput` is every keystroke.                |
| `Label`            | `Label`            | Wraps its control, so that the control needs no `id`.                                                        |
| `NumericInput`     | `NumericInput`     | For a number value; see [Numeric input](#numeric-input).                                                     |
| `NumericInputView` | `NumericInput`     | Its markup alone, with the text as its value; see [Numeric input](#numeric-input).                           |
| `Radio`            | `Radio`            |                                                                                                              |
| `RadioGroup`       | `RadioGroup`       | As a `radiogroup`, labelled by its `label`.                                                                  |
| `SegmentedControl` | `SegmentedControl` | As a `radiogroup`.                                                                                           |
| `Spinner`          | `Spinner`          | With no value, as an indeterminate progress bar.                                                             |
| `Tabs`             | `Tabs`             | As `renderActiveTabPanelOnly`, without `animate`.                                                            |
| `TimePicker`       | `TimePicker`       | To the minute, on a 24-hour clock.                                                                           |

Values are strings, as the browser's own inputs hold them: `YYYY-MM-DD` for a date, `YYYY-MM-DDTHH:mm` for a date with a `timePrecision`, `HH:mm` for a time, and `''` for none. They are wall-clock times with no time zone, so no time zone is offered.

Behavior follows Blueprint's with a controlled value, including what may surprise: changing the month moves a selected date to the same day in that month, and the default range is from 1 January 20 years ago to six months from today. Where it differs:

- Escape while the calendar is open is kept from the page, so that a `<dialog>` the input is in stays open until the next Escape.
- What assistive technology reads out is set by `labels` and `timePickerProps.labels`, in place of react-day-picker's `labels` functions.
- No shortcuts, range pickers, time zones, 12-hour clock or seconds.

## Numeric input

A numeric input is built in two layers, as every numeric input in this repository is (see [`articles/numeric-input-interface.md`](../../articles/numeric-input-interface.md)):

- `NumericInputView` is stateless and controlled, and its value is the **text**: it shows `value` and hands every keystroke to `onValueChange` as a string.
- `NumericInput` holds that text, uncontrolled while the user types, and decodes it only when it is committed — on blur, on Enter, or by a step of the buttons or the arrow keys, which repeats while held and stops at a bound. Then `normalize` makes it a value, the text is rewritten from the value, and `onValueChange` is told if it changed.

Never give a numeric input a number as its controlled value: what the user is half way through typing, such as `-`, `3.` or `1e`, would collapse into `NaN` or a rounded number on the next keystroke. A value that is not a plain number, such as one that may be empty, is held by a layer of its own on top of `NumericInputView`.

```tsx
import { NumericInput } from 'blueprint-synstate';
import { createState } from 'synstate';
import { render } from 'synstate-dom';

// The value is a number; what the user is typing stays text until committed.
const [rate$, setRate] = createState(1.5);

const unmount = render(
    () => (
        <NumericInput
            // `NaN` for text that is not a number, which `normalize` replaces.
            decode={Number.parseFloat}
            encode={(rate) => rate.toFixed(2)}
            normalize={(rate) =>
                Number.isFinite(rate)
                    ? Math.min(20, Math.max(0, Math.round(rate * 100) / 100))
                    : 0
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
