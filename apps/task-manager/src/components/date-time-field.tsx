import { DateInput } from 'blueprint-synstate';
import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { NARROW_QUERY } from '../store/index.mjs';

type Props = Readonly<{
  /** The id of the input, unique on the page. */
  id: string;
  label: string;
  /**
   * As the draft holds it: `YYYY-MM-DDTHH:mm`, `YYYY-MM-DD` while `allDay`,
   * empty for none.
   */
  value: Bindable<string>;
  onChange: (value: string) => void;
  /** Whether a day alone is picked, with no time. */
  allDay: Bindable<boolean>;
  /** The 「終日」 switch was turned; the value is the caller's to convert. */
  onAllDayChange: (allDay: boolean) => void;
}>;

/**
 * A labelled date and time to the minute, in the page's language, picked with
 * blueprint-synstate's `DateInput`: a calendar with 「今日」 and 「クリア」
 * under it, on the browser's wall clock — what the drafts hold. The hours
 * and minutes have arrow buttons, which are easier to hit on a phone than
 * the fields.
 *
 * The calendar stays open when a day is picked, so that the time can be set
 * after it. With 「終日」 on, the calendar picks a day alone, and closes on
 * it.
 */
export const DateTimeField = ({
  id,
  label,
  value,
  onChange,
  allDay,
  onAllDayChange,
}: Props): JSX.Element => {
  // What the calendar takes, all day or not.
  const shared = {
    clearButtonText: m.dateField.clear,
    fill: true,
    id,
    // No on-screen keyboard: on a phone the calendar is the way in, and the
    // keyboard would cover it. A hardware keyboard still types a date.
    inputMode: 'none',
    labels: DATE_PICKER_LABELS,
    locale: m.dateInputLocale,
    showActionsBar: true,
    todayButtonText: m.dateField.today,
    value,
    onChange,
    onInputFocus: scrollFieldIntoView,
  } as const;

  return (
    <div class={constant('field date-time-field')}>
      <div class={constant('date-time-field-head')}>
        <label class={constant('bp6-label')} htmlFor={constant(id)}>
          {constant(label)}
        </label>
        <label class={constant('bp6-control bp6-switch bp6-inline all-day')}>
          <input
            checked={allDay}
            class={constant('bp6-control-input')}
            type={constant('checkbox')}
            onChange={(changed) => {
              onAllDayChange(changed.currentTarget.checked);
            }}
          />
          <span class={constant('bp6-control-indicator')} />
          {constant(m.dateField.allDay)}
        </label>
      </div>
      <If
        cond={allDay}
        then={<DateInput {...shared} placeholder={m.dateField.pickDate} />}
        else={
          <DateInput
            {...shared}
            closeOnSelection={false}
            placeholder={m.dateField.pickDateTime}
            timePickerProps={TIME_PICKER_PROPS}
            timePrecision={'minute'}
          />
        }
      />
    </div>
  );
};

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
  previousMonth: m.dateField.previousMonth,
  nextMonth: m.dateField.nextMonth,
  month: m.dateField.month,
  year: m.dateField.year,
} as const;

const TIME_PICKER_PROPS = {
  showArrowButtons: true,
  labels: {
    hours: m.dateField.hours,
    minutes: m.dateField.minutes,
    increaseHours: m.dateField.increaseHours,
    decreaseHours: m.dateField.decreaseHours,
    increaseMinutes: m.dateField.increaseMinutes,
    decreaseMinutes: m.dateField.decreaseMinutes,
  },
} as const;
