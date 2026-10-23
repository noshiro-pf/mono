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

| Component    | Blueprint's       | Notes                                                                                                        |
| :----------- | :---------------- | :----------------------------------------------------------------------------------------------------------- |
| `DateInput`  | `DateInput`       | The popover is drawn in place, positioned `fixed`, as `usePortal: false` and `positioningStrategy: 'fixed'`. |
| `DatePicker` | `DatePicker`      | react-day-picker's markup and keyboard navigation; month and weekday names from `Intl`.                      |
| `TimePicker` | `TimePicker`      | To the minute, on a 24-hour clock.                                                                           |
| `HtmlSelect` | `HTMLSelect`      | The wrapper is a `<span>`, so that it may sit inside a `<label>`.                                            |
| `Icon`       | `Icon` (16px SVG) | The few icons the components above draw, and `cog`.                                                          |

Values are strings, as the browser's own inputs hold them: `YYYY-MM-DD` for a date, `YYYY-MM-DDTHH:mm` for a date with a `timePrecision`, `HH:mm` for a time, and `''` for none. They are wall-clock times with no time zone, so no time zone is offered.

Behavior follows Blueprint's with a controlled value, including what may surprise: changing the month moves a selected date to the same day in that month, and the default range is from 1 January 20 years ago to six months from today. Where it differs:

- Escape while the calendar is open is kept from the page, so that a `<dialog>` the input is in stays open until the next Escape.
- What assistive technology reads out is set by `labels` and `timePickerProps.labels`, in place of react-day-picker's `labels` functions.
- No shortcuts, range pickers, time zones, 12-hour clock or seconds.
