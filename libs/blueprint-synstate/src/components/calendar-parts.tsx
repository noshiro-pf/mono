// cspell:ignore vhidden
// The month react-day-picker draws for Blueprint's pickers, shared by
// `DatePicker` and `DateRangePicker`: what is picked, and what a press on a day
// does, are theirs.

import {
  createState,
  derive,
  map,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import {
  constant,
  createAfterUpdate,
  For,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  clampDay,
  dayAfterKey,
  isDayInRange,
  isSameDay,
  monthIndexOf,
  monthOfIndex,
  monthWeeks,
  toDateValue,
  type CalendarNames,
  type WallClock,
} from '../date/index.mjs';
import { parseInteger, uniqueId } from '../internal/index.mjs';
import type { DatePickerLabels } from './date-picker.js';
import { HtmlSelect } from './html-select.js';
import { Icon } from './icon.js';

/** How a day is drawn beyond react-day-picker's own classes. */
export type CalendarDayState = Readonly<{
  /** `aria-selected`, and `rdp-day_selected`. */
  selected: Bindable<boolean>;
  /** Further classes, such as a range's ends. */
  classes?: ReadonlyRecord<string, Bindable<boolean>>;
}>;

type Props = Readonly<{
  names: CalendarNames;
  labels: DatePickerLabels;
  min: WallClock;
  max: WallClock;
  today: WallClock;
  weekStartsOn: number;
  /** The month shown, as {@link monthIndexOf} counts it. */
  display$: InitializedObservable<number>;
  /** Asked to show another month: by a select, an arrow, or the keyboard. */
  changeMonth: (index: number) => void;
  dayState: (day: WallClock) => CalendarDayState;
  onDayClick: (day: WallClock) => void;
  onDayMouseEnter?: (day: WallClock) => void;
  onDayMouseLeave?: (day: WallClock) => void;
  /**
   * The days the grid's one tab stop goes to, in order, before today and the
   * first day that can be picked: what is picked.
   */
  focusCandidates$: InitializedObservable<readonly WallClock[]>;
}>;

/**
 * `div.rdp` with one month: the month and year selects with the arrows beside
 * them, and the month's weeks with the days of the months around it.
 *
 * In the grid, the arrow keys move by a day and a week, PageUp and PageDown by
 * a month (a year with Shift), Home and End to the ends of the week. Only one
 * day is in the tab order: the one last focused, or else the first of
 * `focusCandidates$`, today, or the first day that can be picked.
 */
export const Calendar = ({
  names,
  labels,
  min,
  max,
  today,
  weekStartsOn,
  display$,
  changeMonth,
  dayState,
  onDayClick,
  onDayMouseEnter,
  onDayMouseLeave,
  focusCandidates$,
}: Props): JSX.Element => {
  const [focused$, setFocused] = createState<Optional<WallClock>>(
    Optional.none,
  );

  const [caretRight$, setCaretRight] = createState(0);

  const afterUpdate = createAfterUpdate();

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
      mut_dayButtons.get(toDateValue(next))?.focus();
    });
  };

  const focusTarget$ = derive(
    [display$, focusCandidates$, focused$],
    (index, candidates, focused) => {
      const isTarget = (day: WallClock): boolean =>
        monthIndexOf(day) === index && isDayInRange(day, min, max);

      const target = [
        ...(Optional.isSome(focused)
          ? ([focused.value] as const)
          : ([] as const)),
        ...candidates,
        today,
        clampDay(
          { ...monthOfIndex(index), day: 1, hour: 0, minute: 0 },
          min,
          max,
        ),
      ].find(isTarget);

      return target === undefined ? '' : toDateValue(target);
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
    const key = toDateValue(day);

    const outside = monthIndexOf(day) !== shown;

    const disabled = !isDayInRange(day, min, max);

    const { selected, classes = {} } = dayState(day);

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
          aria-selected={mapBindable(selected, (s) => (s ? 'true' : undefined))}
          class={{
            'bp6-button': constant(true),
            'bp6-minimal': constant(true),
            'rdp-day': constant(true),
            'rdp-day_outside': constant(outside),
            'rdp-day_selected': selected,
            'rdp-day_today': constant(isSameDay(day, today)),
            'rdp-day_disabled': constant(disabled),
            ...classes,
          }}
          disabled={constant(disabled)}
          name={constant('day')}
          role={constant('gridcell')}
          tabIndex={focusTarget$.pipe(
            map((target) => (!outside && target === key ? 0 : -1)),
          )}
          type={constant('button')}
          onClick={() => {
            onDayClick(day);
          }}
          onFocus={() => {
            setFocused(Optional.some(day));
          }}
          onKeyDown={(event) => {
            moveFocus(day, event);
          }}
          onMouseEnter={() => {
            if (!disabled) {
              onDayMouseEnter?.(day);
            }
          }}
          onMouseLeave={() => {
            if (!disabled) {
              onDayMouseLeave?.(day);
            }
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
            {display$.pipe(
              map((index) => {
                const { year, month } = monthOfIndex(index);

                return names.caption(year, month);
              }),
            )}
          </div>
        </div>
        <div>
          <HtmlSelect
            aria-label={constant(labels.month)}
            class={'bp6-datepicker-month-select'}
            iconStyle={caretRight$.pipe(map((right) => `right: ${right}px;`))}
            minimal
            name={'months'}
            selectRef={(select) => {
              display$.subscribe((index) => {
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
            value={display$.pipe(
              map((index) => (monthOfIndex(index).month - 1).toString()),
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
                <option
                  value={option$.pipe(map((o) => (o.value - 1).toString()))}
                >
                  {option$.pipe(map((o) => o.label))}
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
            value={display$.pipe(
              map((index) => monthOfIndex(index).year.toString()),
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
                  disabled={option$.pipe(map((o) => o.disabled))}
                  value={option$.pipe(map((o) => o.year.toString()))}
                >
                  {option$.pipe(map((o) => o.year.toString()))}
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
          disabled={display$.pipe(map((index) => index <= minIndex))}
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
          disabled={display$.pipe(map((index) => index >= maxIndex))}
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
        <For
          items={display$.pipe(map((index) => [index]))}
          key={(index) => index}
        >
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

  return (
    <div class={constant('rdp')}>
      <div class={constant('rdp-months')}>
        <div class={constant('rdp-month rdp-caption_start rdp-caption_end')}>
          {caption}
          {table}
        </div>
      </div>
    </div>
  );
};

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
