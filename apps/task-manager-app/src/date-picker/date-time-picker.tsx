/**
 * Blueprint's `DateInput`, a React component, run through `preact/compat`:
 * the package's `react` and `react-dom` are `@preact/compat` (see
 * `package.json`), so what it imports as React is this page's Preact.
 *
 * Only `DateTimeField` loads this directory, and only when a dialog first
 * shows a date, so the picker and date-fns stay out of the first load.
 */

import { DateInput, TimePrecision } from '@blueprintjs/datetime';
import { ja } from 'date-fns/locale';
import { memoNamed } from 'preact-utils';
import { useCallback, useMemo } from 'preact/hooks';
import { NARROW_QUERY } from '../store/index.mjs';
import { fromDateInputValue, toDateInputValue } from '../view-model/index.mjs';

type Props = Readonly<{
  /** The id of the text input, for the field's `<label>`. */
  id: string;
  /** As the draft holds it: `YYYY-MM-DDTHH:mm`, empty for none. */
  value: string;
  onChange: (value: string) => void;
}>;

/**
 * A date and time to the minute, in Japanese, with 「今日」 and 「クリア」
 * under the calendar, on the browser's time zone (the drafts are on its
 * wall clock, so no zone is offered). The hours and minutes have arrow
 * buttons, which are easier to hit on a phone than the fields.
 *
 * The calendar is drawn in place rather than in a portal, positioned
 * `fixed`: the dialog is a modal `<dialog>` in the top layer, so a portal on
 * `<body>` would be drawn behind it and be inert; in place, it is inside the
 * dialog, follows `.bp6-dark` from `<html>`, and is not clipped by the
 * dialog's scrolling body.
 */
export const DateTimePicker = memoNamed<Props>('DateTimePicker', (props) => {
  const { id, value, onChange } = props;

  // No on-screen keyboard: on a phone the calendar is the way in, and the
  // keyboard would cover it. A hardware keyboard still types a date.
  const inputProps = useMemo(
    () => ({ id, inputMode: 'none', onFocus: onInputFocus }) as const,
    [id],
  );

  const handleChange = useCallback(
    (next: string | null) => {
      onChange(fromDateInputValue(next));
    },
    [onChange],
  );

  return (
    <DateInput
      canClearSelection
      clearButtonText={'クリア'}
      closeOnSelection={false}
      dateFnsFormat={DATE_FORMAT}
      fill
      inputProps={inputProps}
      locale={ja}
      placeholder={'日時を選ぶ（例: 2026/10/09 18:00）'}
      popoverProps={POPOVER_PROPS}
      showActionsBar
      showTimezoneSelect={false}
      timePickerProps={TIME_PICKER_PROPS}
      timePrecision={TimePrecision.MINUTE}
      todayButtonText={'今日'}
      value={toDateInputValue(value)}
      onChange={handleChange}
    />
  );
});

// Outside the component, since it reads none of its props.

/**
 * On a phone the calendar takes about half the screen, so a field low in
 * the dialog is first scrolled to the top of it, leaving the room below for
 * the calendar.
 */
const onInputFocus = (
  focused: Readonly<{ currentTarget: HTMLInputElement }>,
): void => {
  if (matchMedia(NARROW_QUERY).matches) {
    focused.currentTarget
      .closest('.date-time-field')
      ?.scrollIntoView({ block: 'start' });
  }
};

const DATE_FORMAT = 'yyyy/MM/dd HH:mm';

const POPOVER_PROPS = {
  usePortal: false,
  positioningStrategy: 'fixed',
  placement: 'bottom-start',
} as const;

const TIME_PICKER_PROPS = { showArrowButtons: true } as const;
