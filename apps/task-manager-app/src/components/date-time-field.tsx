import { DateInput } from 'blueprint-synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { NARROW_QUERY } from '../store/index.mjs';

type Props = Readonly<{
  /** The id of the input, unique on the page. */
  id: string;
  label: string;
  /** As the draft holds it: `YYYY-MM-DDTHH:mm`, empty for none. */
  value: Bindable<string>;
  onChange: (value: string) => void;
}>;

/**
 * A labelled date and time to the minute, in Japanese, picked with
 * blueprint-synstate's `DateInput`: a calendar with 「今日」 and 「クリア」
 * under it, on the browser's wall clock — what the drafts hold. The hours
 * and minutes have arrow buttons, which are easier to hit on a phone than
 * the fields.
 *
 * The calendar stays open when a day is picked, so that the time can be set
 * after it.
 */
export const DateTimeField = ({
  id,
  label,
  value,
  onChange,
}: Props): JSX.Element => (
  <div class={constant('field date-time-field')}>
    <label class={constant('bp6-label')} htmlFor={constant(id)}>
      {constant(label)}
    </label>
    <DateInput
      clearButtonText={'クリア'}
      closeOnSelection={false}
      fill
      id={id}
      // No on-screen keyboard: on a phone the calendar is the way in, and
      // the keyboard would cover it. A hardware keyboard still types a date.
      inputMode={'none'}
      labels={DATE_PICKER_LABELS}
      locale={'ja'}
      placeholder={'日時を選ぶ（例: 2026/10/09 18:00）'}
      showActionsBar
      timePickerProps={TIME_PICKER_PROPS}
      timePrecision={'minute'}
      todayButtonText={'今日'}
      value={value}
      onChange={onChange}
      onInputFocus={scrollFieldIntoView}
    />
  </div>
);

/**
 * On a phone the calendar takes about half the screen, so a field low in
 * the dialog is first scrolled to the top of it, leaving the room below for
 * the calendar.
 */
const scrollFieldIntoView = (input: HTMLInputElement): void => {
  if (matchMedia(NARROW_QUERY).matches) {
    input.closest('.date-time-field')?.scrollIntoView({ block: 'start' });
  }
};

const DATE_PICKER_LABELS = {
  previousMonth: '前の月',
  nextMonth: '次の月',
  month: '月',
  year: '年',
} as const;

const TIME_PICKER_PROPS = {
  showArrowButtons: true,
  labels: {
    hours: '時',
    minutes: '分',
    increaseHours: '1 時間進める',
    decreaseHours: '1 時間戻す',
    increaseMinutes: '1 分進める',
    decreaseMinutes: '1 分戻す',
  },
} as const;
