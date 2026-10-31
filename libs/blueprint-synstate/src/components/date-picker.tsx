// cspell:ignore vhidden

import { createState, derive, map, onScopeDispose } from 'synstate';
import {
  constant,
  For,
  toObservable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import {
  calendarNames,
  clampDay,
  dateRange,
  dayAfterKey,
  daysInMonth,
  formatTime,
  isDayInRange,
  isSameDay,
  monthIndexOf,
  monthOfIndex,
  monthWeeks,
  now,
  parseTime,
  parseWallClock,
  toDateTimeValue,
  toDateValue,
  withDayOf,
  type TimePrecision,
  type WallClock,
} from '../date/index.mjs';
import {
  createAfterUpdate,
  parseInteger,
  subscribeInScope,
  uniqueId,
} from '../internal/index.mjs';
import { HtmlSelect } from './html-select.js';
import { Icon } from './icon.js';
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

/** The props of a {@link DatePicker} other than its value. */
export type DatePickerOptions = Readonly<{
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
  /** Whether pressing the selected day again clears it, and 「クリア」 is offered. */
  canClearSelection?: boolean;
  /** The bar of the today and clear buttons under the calendar. */
  showActionsBar?: boolean;
  todayButtonText?: string;
  clearButtonText?: string;
  /** Marks today on the calendar. */
  highlightCurrentDay?: boolean;
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
  canClearSelection = true,
  showActionsBar = false,
  todayButtonText = 'Today',
  clearButtonText = 'Clear',
  highlightCurrentDay = false,
  timePickerProps,
  labels: labelOverrides,
}: Props): JSX.Element => {
  const labels = { ...DEFAULT_DATE_PICKER_LABELS, ...labelOverrides } as const;

  const names = calendarNames(locale);

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

  const [focused$, setFocused] = createState<Optional<WallClock>>(
    Optional.none,
  );

  const [caretRight$, setCaretRight] = createState(0);

  const afterUpdate = createAfterUpdate();

  // The month shown follows the value. Written once the update that brought the
  // value has finished, since a state is not written while another is
  // propagating.
  subscribeInScope(value$, (current) => {
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

  const mut_dayButtons = new Map<string, HTMLButtonElement>();

  const moveFocus = (
    from: WallClock,
    event: KeyboardEvent & Readonly<{ currentTarget: Element }>,
  ): void => {
    const moved = dayAfterKey(from, event, weekStartsOn);

    if (moved === undefined) {
      return;
    }

    event.preventDefault();

    event.stopPropagation();

    const next = clampDay(moved, min, max);

    if (isSameDay(next, from)) {
      return;
    }

    setFocused(Optional.some(next));

    if (monthIndexOf(next) !== display$.getSnapshot().value) {
      changeMonth(monthIndexOf(next));
    }

    afterUpdate(() => {
      mut_dayButtons.get(dayKey(next))?.focus();
    });
  };

  const focusTarget$ = derive(
    [display$, value$, focused$],
    (index, current, focused) => {
      const isTarget = (day: WallClock): boolean =>
        monthIndexOf(day) === index && isDayInRange(day, min, max);

      const candidates = [
        ...(Optional.isSome(focused)
          ? ([focused.value] as const)
          : ([] as const)),
        ...(Optional.isSome(current)
          ? ([current.value] as const)
          : ([] as const)),
        today,
        clampDay(
          { ...monthOfIndex(index), day: 1, hour: 0, minute: 0 },
          min,
          max,
        ),
      ] as const;

      const target = candidates.find(isTarget);

      return target === undefined ? '' : dayKey(target);
    },
  );

  const minIndex = monthIndexOf(min);

  const maxIndex = monthIndexOf(max);

  const monthOptions$ = display$.pipe(
    map((index) => {
      const { year } = monthOfIndex(index);

      const first = year === min.year ? min.month : 1;

      const last = year === max.year ? max.month : 12;

      return names.months
        .map((label, i) => ({ value: i + 1, label }))
        .filter(({ value: month }) => first <= month && month <= last);
    }),
  );

  const yearOptions$ = display$.pipe(
    map((index) => {
      const { year } = monthOfIndex(index);

      const years = Array.from({ length: max.year - min.year + 1 }, (_, i) => ({
        year: min.year + i,
        disabled: false,
      }));

      // A year past the range is listed, disabled, while it is shown.
      return year > max.year
        ? Arr.toPushed(years, { year, disabled: true })
        : years;
    }),
  );

  const weekdayOrder = Array.from(
    { length: 7 },
    (_, i) => (i + weekStartsOn) % 7,
  );

  const renderDay = (day: WallClock, shown: number): JSX.Element => {
    const key = dayKey(day);

    const outside = monthIndexOf(day) !== shown;

    const disabled = !isDayInRange(day, min, max);

    const isSelected$ = value$.pipe(
      map(
        (current) => Optional.isSome(current) && isSameDay(current.value, day),
      ),
    );

    return (
      <td class={constant('rdp-cell')} role={constant('presentation')}>
        <button
          ref={(button) => {
            mut_dayButtons.set(key, button);

            onScopeDispose(() => {
              if (mut_dayButtons.get(key) === button) {
                mut_dayButtons.delete(key);
              }
            });
          }}
          aria-selected={view(isSelected$, (s) => (s ? 'true' : undefined))}
          class={{
            'bp6-button': constant(true),
            'bp6-minimal': constant(true),
            'rdp-day': constant(true),
            'rdp-day_outside': constant(outside),
            'rdp-day_selected': isSelected$,
            'rdp-day_today': constant(isSameDay(day, today)),
            'rdp-day_disabled': constant(disabled),
          }}
          disabled={constant(disabled)}
          name={constant('day')}
          role={constant('gridcell')}
          tabIndex={view(focusTarget$, (target) =>
            !outside && target === key ? 0 : -1,
          )}
          type={constant('button')}
          onClick={() => {
            selectDay(day);
          }}
          onFocus={() => {
            setFocused(Optional.some(day));
          }}
          onKeyDown={(event) => {
            moveFocus(day, event);
          }}
        >
          {constant(day.day.toString())}
        </button>
      </td>
    );
  };

  // The grid is named by the month and year above it.
  const captionId = uniqueId('date-picker-caption');

  const caption = (
    <div class={constant('rdp-caption')}>
      <div class={constant('rdp-caption_dropdowns')}>
        <div class={constant('rdp-vhidden')}>
          <div
            aria-live={constant('polite')}
            class={constant('rdp-caption_label')}
            id={constant(captionId)}
            role={constant('presentation')}
          >
            {view(display$, (index) => {
              const { year, month } = monthOfIndex(index);

              return names.caption(year, month);
            })}
          </div>
        </div>
        <div>
          <HtmlSelect
            aria-label={constant(labels.month)}
            class={'bp6-datepicker-month-select'}
            iconStyle={view(caretRight$, (right) => `right: ${right}px;`)}
            minimal
            name={'months'}
            selectRef={(select) => {
              subscribeInScope(display$, (index) => {
                afterUpdate(() => {
                  const container = select.parentElement?.parentElement;

                  if (container === null || container === undefined) {
                    return;
                  }

                  const text =
                    names.months[monthOfIndex(index).month - 1] ?? '';

                  setCaretRight(
                    Math.max(
                      2,
                      select.clientWidth -
                        measureTextWidth(text, container) -
                        ICON_SIZE -
                        2,
                    ),
                  );
                });
              });
            }}
            value={view(display$, (index) =>
              (monthOfIndex(index).month - 1).toString(),
            )}
            onChange={(changed) => {
              const month = parseInteger(changed.currentTarget.value);

              if (!Number.isNaN(month)) {
                changeMonth(
                  monthIndexOf({
                    year: monthOfIndex(display$.getSnapshot().value).year,
                    month: month + 1,
                  }),
                );
              }
            }}
          >
            <For items={monthOptions$} key={(option) => option.value}>
              {(option$) => (
                <option value={view(option$, (o) => (o.value - 1).toString())}>
                  {view(option$, (o) => o.label)}
                </option>
              )}
            </For>
          </HtmlSelect>
        </div>
        <div>
          <HtmlSelect
            aria-label={constant(labels.year)}
            class={'bp6-datepicker-year-select'}
            minimal
            name={'years'}
            value={view(display$, (index) =>
              monthOfIndex(index).year.toString(),
            )}
            onChange={(changed) => {
              const year = parseInteger(changed.currentTarget.value);

              if (!Number.isNaN(year)) {
                changeMonth(
                  monthIndexOf({
                    year,
                    month: monthOfIndex(display$.getSnapshot().value).month,
                  }),
                );
              }
            }}
          >
            <For items={yearOptions$} key={(option) => option.year}>
              {(option$) => (
                <option
                  disabled={view(option$, (o) => o.disabled)}
                  value={view(option$, (o) => o.year.toString())}
                >
                  {view(option$, (o) => o.year.toString())}
                </option>
              )}
            </For>
          </HtmlSelect>
        </div>
      </div>
      <div class={constant('rdp-nav')}>
        <button
          aria-label={constant(labels.previousMonth)}
          class={constant(
            'bp6-button bp6-minimal bp6-datepicker-nav-button bp6-datepicker-nav-button-previous',
          )}
          disabled={view(display$, (index) => index <= minIndex)}
          name={constant('previous-month')}
          type={constant('button')}
          onClick={() => {
            changeMonth(display$.getSnapshot().value - 1);
          }}
        >
          <Icon class={'rdp-nav_icon'} icon={'chevron-left'} />
        </button>
        <button
          aria-label={constant(labels.nextMonth)}
          class={constant(
            'bp6-button bp6-minimal bp6-datepicker-nav-button bp6-datepicker-nav-button-next',
          )}
          disabled={view(display$, (index) => index >= maxIndex)}
          name={constant('next-month')}
          type={constant('button')}
          onClick={() => {
            changeMonth(display$.getSnapshot().value + 1);
          }}
        >
          <Icon class={'rdp-nav_icon'} icon={'chevron-right'} />
        </button>
      </div>
    </div>
  );

  const table = (
    <table
      aria-labelledby={constant(captionId)}
      class={constant('rdp-table')}
      role={constant('grid')}
    >
      <thead class={constant('rdp-head')}>
        <tr class={constant('rdp-head_row')}>
          {weekdayOrder.map((weekday) => (
            <th
              aria-label={constant(names.weekdaysLong[weekday] ?? '')}
              class={constant('rdp-head_cell')}
              scope={constant('col')}
            >
              {constant(names.weekdaysShort[weekday] ?? '')}
            </th>
          ))}
        </tr>
      </thead>
      <tbody class={constant('rdp-tbody')}>
        {/* One row per month, so that a month's days are built once. */}
        <For items={view(display$, (index) => [index])} key={(index) => index}>
          {(index$) => {
            const shown = index$.getSnapshot().value;

            const { year, month } = monthOfIndex(shown);

            return (
              <>
                {monthWeeks(year, month, weekStartsOn).map((week) => (
                  <tr class={constant('rdp-row')}>
                    {week.map((day) => renderDay(day, shown))}
                  </tr>
                ))}
              </>
            );
          }}
        </For>
      </tbody>
    </table>
  );

  const todayEnabled = isDayInRange(today, min, max);

  return (
    <div
      class={constant(
        highlightCurrentDay
          ? 'bp6-datepicker bp6-datepicker-highlight-current-day'
          : 'bp6-datepicker',
      )}
    >
      <div class={constant('bp6-datepicker-content')}>
        <div class={constant('rdp')}>
          <div class={constant('rdp-months')}>
            <div
              class={constant('rdp-month rdp-caption_start rdp-caption_end')}
            >
              {caption}
              {table}
            </div>
          </div>
        </div>
        {timePrecision === 'minute' ? (
          <div class={constant('bp6-datepicker-timepicker-wrapper')}>
            <TimePicker
              labels={timePickerProps?.labels ?? {}}
              showArrowButtons={timePickerProps?.showArrowButtons ?? false}
              value={view(value$, (current) =>
                Optional.isSome(current) ? formatTime(current.value) : '',
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

const dayKey = (day: WallClock): string => toDateValue(day);

const ICON_SIZE = 16;

/**
 * The width of `text` as the month select draws it, measured in a span of
 * Blueprint's `bp6-datepicker-caption-measure` put in `container` for the
 * purpose, as Blueprint measures it to put the caret beside the month.
 */
const measureTextWidth = (text: string, container: Element): number => {
  const mut_span = document.createElement('span');

  mut_span.classList.add('bp6-datepicker-caption-measure');

  mut_span.textContent = text;

  container.append(mut_span);

  const width = mut_span.offsetWidth;

  mut_span.remove();

  return width;
};
