import { createState, map } from 'synstate';
import {
  constant,
  createAfterUpdate,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  calendarNames,
  clampDay,
  dateRange,
  daysInMonth,
  formatTime,
  isDayInRange,
  isSameDay,
  monthIndexOf,
  monthOfIndex,
  now,
  parseTime,
  parseWallClock,
  toDateTimeValue,
  toDateValue,
  withDayOf,
  type TimePrecision,
  type WallClock,
  type WeekdayNames,
} from '../date/index.mjs';
import { Calendar } from './calendar-parts.js';
import { MenuItem } from './menu-item.js';
import { Menu } from './menu.js';
import { TimePicker, type TimePickerLabels } from './time-picker.js';

/** What a {@link DatePicker} reads out; react-day-picker's wording by default. */
export type DatePickerLabels = Readonly<{
  previousMonth: string;
  nextMonth: string;
  month: string;
  year: string;
}>;

export const DEFAULT_DATE_PICKER_LABELS: DatePickerLabels = {
  previousMonth: 'Go to previous month',
  nextMonth: 'Go to next month',
  month: 'Month: ',
  year: 'Year: ',
} as const;

/**
 * Blueprint's `DatePickerShortcut`: a value offered by a label, beside the
 * calendar.
 */
export type DatePickerShortcut = Readonly<{
  label: string;
  /** `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm`. */
  value: string;
  /** Takes the time of `value` too, rather than keeping the value's. */
  includeTime?: boolean;
}>;

/** The props of a {@link DatePicker} other than its value. */
export type DatePickerOptions = Readonly<{
  /** Drawn in a menu before the calendar; none if omitted. */
  shortcuts?: readonly DatePickerShortcut[];
  /** `'minute'` adds the time picker, and the value then has a time. */
  timePrecision?: TimePrecision;
  /** The BCP 47 tag the month and weekday names are in; `en-US` if omitted. */
  locale?: string;
  /** `YYYY-MM-DD`, the first day that can be picked; 1 January 20 years ago if omitted. */
  minDate?: string;
  /** `YYYY-MM-DD`, the last day that can be picked; six months from today if omitted. */
  maxDate?: string;
  /** The first day of each week drawn, 0 for Sunday (the default) to 6. */
  weekStartsOn?: number;
  /**
   * The heads of the weekday columns, Sunday first whatever `weekStartsOn` is;
   * `Intl`'s short names in `locale` if omitted. See {@link WeekdayNames}.
   */
  weekdayNames?: WeekdayNames;
  /** Whether pressing the selected day again clears it, and 「クリア」 is offered. */
  canClearSelection?: boolean;
  /** The bar of the today and clear buttons under the calendar. */
  showActionsBar?: boolean;
  todayButtonText?: string;
  clearButtonText?: string;
  /** Marks today on the calendar. */
  highlightCurrentDay?: boolean;
  /** The year menu before the month menu, as Blueprint's `reverseMonthAndYearMenus`. */
  reverseMonthAndYearMenus?: boolean;
  timePickerProps?: Readonly<{
    showArrowButtons?: boolean;
    labels?: Partial<TimePickerLabels>;
  }>;
  labels?: Partial<DatePickerLabels>;
}>;

type Props = DatePickerOptions &
  Readonly<{
    /**
     * `YYYY-MM-DDTHH:mm` with a `timePrecision`, `YYYY-MM-DD` without, and `''`
     * for none.
     */
    value: Bindable<string>;
    onChange: (value: string) => void;
    /**
     * The index of the shortcut drawn as picked, `-1` for none; kept by the
     * picker itself if omitted.
     */
    selectedShortcutIndex?: Bindable<number>;
    /** Called with the index of a shortcut pressed. */
    onShortcutChange?: (index: number) => void;
  }>;

/**
 * Blueprint's `DatePicker`, in the markup Blueprint renders through
 * react-day-picker, so that `@blueprintjs/datetime`'s style sheet draws it:
 * the month and year selects with the arrows beside them, the month's weeks
 * with the days of the months around it, the time picker, and the today and
 * clear buttons.
 *
 * It behaves as Blueprint's does:
 *
 * - The month shown follows the value. Changing the month — by a select, an
 *   arrow, or the keyboard leaving the month — moves a value to the same day
 *   in that month, the last where the month is shorter, within the range.
 * - Pressing a day keeps the value's time, and pressing the selected day
 *   again clears the value, unless `canClearSelection` is `false`.
 * - The time set without a date is today's.
 * - In the grid, the arrow keys move by a day and a week, PageUp and PageDown
 *   by a month (a year with Shift), Home and End to the ends of the week.
 *   Only one day is in the tab order: the one last focused, or else the
 *   selected day, today, or the first day that can be picked.
 */
export const DatePicker = ({
  value,
  onChange,
  timePrecision,
  locale = 'en-US',
  minDate,
  maxDate,
  weekStartsOn = 0,
  weekdayNames,
  canClearSelection = true,
  showActionsBar = false,
  todayButtonText = 'Today',
  clearButtonText = 'Clear',
  highlightCurrentDay = false,
  reverseMonthAndYearMenus = false,
  timePickerProps,
  labels: labelOverrides,
  shortcuts,
  selectedShortcutIndex,
  onShortcutChange,
}: Props): JSX.Element => {
  const labels = { ...DEFAULT_DATE_PICKER_LABELS, ...labelOverrides } as const;

  // Read once, as `locale` is: a picker keeps the names it was drawn with.
  const names = calendarNames(locale, weekdayNames);

  const today = now();

  const { min, max } = dateRange(today, minDate, maxDate);

  const toValue = (clock: WallClock): string =>
    timePrecision === 'minute' ? toDateTimeValue(clock) : toDateValue(clock);

  const value$ = toObservable(value).pipe(map(parseWallClock));

  const selected = (): Optional<WallClock> => value$.getSnapshot().value;

  const initial = selected();

  const [display$, setDisplay] = createState(
    monthIndexOf(
      Optional.isSome(initial) ? initial.value : clampDay(today, min, max),
    ),
  );

  // The day of the month the value was last on, which a change of month keeps;
  // Blueprint's `selectedDay`.
  const mut_memory: { selectedDay: number } = {
    selectedDay: Optional.isSome(initial) ? initial.value.day : 1,
  };

  const afterUpdate = createAfterUpdate();

  // The month shown follows the value. Written once the update that brought the
  // value has finished, since a state is not written while another is
  // propagating.
  value$.subscribe((current) => {
    if (Optional.isSome(current)) {
      afterUpdate(() => {
        mut_memory.selectedDay = current.value.day;

        setDisplay(monthIndexOf(current.value));
      });
    }
  });

  const changeMonth = (index: number): void => {
    const { year, month } = monthOfIndex(index);

    const current = selected();

    const date = clampDay(
      {
        year,
        month,
        day: Math.min(mut_memory.selectedDay, daysInMonth(year, month)),
        hour: Optional.isSome(current) ? current.value.hour : 0,
        minute: Optional.isSome(current) ? current.value.minute : 0,
      },
      min,
      max,
    );

    setDisplay(monthIndexOf(date));

    if (Optional.isSome(current)) {
      onChange(toValue(date));
    }
  };

  const selectDay = (day: WallClock): void => {
    const current = selected();

    if (
      canClearSelection &&
      Optional.isSome(current) &&
      isSameDay(current.value, day)
    ) {
      onChange('');

      return;
    }

    mut_memory.selectedDay = day.day;

    onChange(
      toValue(Optional.isSome(current) ? withDayOf(current.value, day) : day),
    );
  };

  const isSelectedDay = (day: WallClock): Bindable<boolean> =>
    value$.pipe(
      map(
        (current) => Optional.isSome(current) && isSameDay(current.value, day),
      ),
    );

  const todayEnabled = isDayInRange(today, min, max);

  const [ownShortcutIndex$, setOwnShortcutIndex] = createState(-1);

  const shortcutIndex$ =
    selectedShortcutIndex === undefined
      ? ownShortcutIndex$
      : toObservable(selectedShortcutIndex);

  // Blueprint's `handleShortcutClick`: the shortcut's day, at its time with
  // `includeTime`, or else at the value's.
  const pickShortcut = (shortcut: DatePickerShortcut, index: number): void => {
    const clock = parseWallClock(shortcut.value);

    if (Optional.isNone(clock)) {
      return;
    }

    const current = selected();

    const next =
      shortcut.includeTime === true
        ? clock.value
        : Optional.isSome(current)
          ? withDayOf(current.value, clock.value)
          : ({ ...clock.value, hour: 0, minute: 0 } as const);

    mut_memory.selectedDay = next.day;

    setDisplay(monthIndexOf(next));

    onChange(toValue(next));

    if (selectedShortcutIndex === undefined) {
      setOwnShortcutIndex(index);
    }

    onShortcutChange?.(index);
  };

  return (
    <div
      class={constant(
        [
          'bp6-datepicker',
          ...(highlightCurrentDay
            ? ['bp6-datepicker-highlight-current-day']
            : []),
          ...(reverseMonthAndYearMenus
            ? ['bp6-datepicker-reverse-month-and-year']
            : []),
        ].join(' '),
      )}
    >
      {shortcuts === undefined ? (
        []
      ) : (
        <>
          <Menu
            aria-label={'Date picker shortcuts'}
            class={'bp6-daterangepicker-shortcuts'}
            tabIndex={0}
          >
            {shortcuts.map((shortcut, index) => {
              const clock = parseWallClock(shortcut.value);

              return (
                <MenuItem
                  active={shortcutIndex$.pipe(
                    map((picked) => picked === index),
                  )}
                  disabled={
                    Optional.isNone(clock) ||
                    !isDayInRange(clock.value, min, max)
                  }
                  shouldDismissPopover={false}
                  text={constant(shortcut.label)}
                  onClick={() => {
                    pickShortcut(shortcut, index);
                  }}
                />
              );
            })}
          </Menu>
          <div class={constant('bp6-divider')} />
        </>
      )}
      <div class={constant('bp6-datepicker-content')}>
        <Calendar
          changeMonth={changeMonth}
          dayState={(day) => ({ selected: isSelectedDay(day) })}
          display$={display$}
          focusCandidates$={value$.pipe(
            map((current) => (Optional.isSome(current) ? [current.value] : [])),
          )}
          labels={labels}
          max={max}
          min={min}
          names={names}
          today={today}
          weekStartsOn={weekStartsOn}
          onDayClick={selectDay}
        />
        {timePrecision === 'minute' ? (
          <div class={constant('bp6-datepicker-timepicker-wrapper')}>
            <TimePicker
              labels={timePickerProps?.labels ?? {}}
              showArrowButtons={timePickerProps?.showArrowButtons ?? false}
              value={value$.pipe(
                map((current) =>
                  Optional.isSome(current) ? formatTime(current.value) : '',
                ),
              )}
              onChange={(time) => {
                const current = selected();

                onChange(
                  toValue({
                    ...(Optional.isSome(current) ? current.value : now()),
                    ...parseTime(time),
                  }),
                );
              }}
            />
          </div>
        ) : (
          []
        )}
        {showActionsBar ? (
          <>
            <div class={constant('bp6-divider')} />
            <div class={constant('bp6-datepicker-footer')}>
              <FooterButton
                disabled={!todayEnabled}
                text={todayButtonText}
                onClick={() => {
                  const current = now();

                  mut_memory.selectedDay = current.day;

                  setDisplay(monthIndexOf(current));

                  onChange(toValue(current));
                }}
              />
              <FooterButton
                disabled={!canClearSelection}
                text={clearButtonText}
                onClick={() => {
                  onChange('');
                }}
              />
            </div>
          </>
        ) : (
          []
        )}
      </div>
    </div>
  );
};

const FooterButton = ({
  text,
  disabled,
  onClick,
}: Readonly<{
  text: string;
  disabled: boolean;
  onClick: () => void;
}>): JSX.Element => (
  <button
    class={constant(
      disabled
        ? 'bp6-button bp6-minimal bp6-disabled'
        : 'bp6-button bp6-minimal',
    )}
    disabled={constant(disabled)}
    type={constant('button')}
    onClick={onClick}
  >
    <span class={constant('bp6-button-text')}>{constant(text)}</span>
  </button>
);
