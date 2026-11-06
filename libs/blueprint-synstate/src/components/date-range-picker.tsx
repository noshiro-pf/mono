import { createState, derive, map } from 'synstate';
import {
  constant,
  createAfterUpdate,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Num, Optional } from 'ts-data-forge';
import {
  addDays,
  calendarNames,
  dateRange,
  isDayInRange,
  monthIndexOf,
  now,
  parseWallClock,
  toDateValue,
  type WallClock,
} from '../date/index.mjs';
import {
  localNoon,
  nextRangeState,
  type Boundary,
  type DayRange,
} from '../internal/index.mjs';
import { Calendar, type CalendarDayState } from './calendar-parts.js';
import {
  DEFAULT_DATE_PICKER_LABELS,
  type DatePickerLabels,
} from './date-picker.js';

export type { Boundary, DayRange } from '../internal/index.mjs';

/** The props of a {@link DateRangePicker} other than its value. */
export type DateRangePickerOptions = Readonly<{
  /** A press on the start's day with no end picks that one day. */
  allowSingleDayRange?: boolean;
  /** The BCP 47 tag the month and weekday names are in; `en-US` if omitted. */
  locale?: string;
  /** `YYYY-MM-DD`, the first day that can be picked; 1 January 20 years ago if omitted. */
  minDate?: string;
  /** `YYYY-MM-DD`, the last day that can be picked; six months from today if omitted. */
  maxDate?: string;
  /** The first day of each week drawn, 0 for Sunday (the default) to 6. */
  weekStartsOn?: number;
  /** Marks today on the calendar. */
  highlightCurrentDay?: boolean;
  labels?: Partial<DatePickerLabels>;
}>;

type Props = DateRangePickerOptions &
  Readonly<{
    /** The days picked, each `YYYY-MM-DD` or `''` for none. */
    value: Bindable<DayRange>;
    onChange: (value: DayRange) => void;
    /** The end a press changes; without it, a press starts or finishes a range. */
    boundaryToModify?: Bindable<Boundary | undefined>;
    /**
     * The range a press on the day under the pointer would make, and the end it
     * would leave to be picked; `undefined` as the pointer leaves the day.
     */
    onHoverChange?: (
      range: DayRange | undefined,
      day: string,
      boundary: Boundary | undefined,
    ) => void;
  }>;

/**
 * Blueprint's `DateRangePicker` showing one month (`singleMonthOnly`), in the
 * markup Blueprint renders through react-day-picker: the days picked are drawn
 * as a range, and while the pointer is over a day, the range a press there
 * would make.
 */
export const DateRangePicker = ({
  value,
  onChange,
  boundaryToModify,
  onHoverChange,
  allowSingleDayRange = false,
  locale = 'en-US',
  minDate,
  maxDate,
  weekStartsOn = 0,
  highlightCurrentDay = false,
  labels: labelOverrides,
}: Props): JSX.Element => {
  const labels = { ...DEFAULT_DATE_PICKER_LABELS, ...labelOverrides } as const;

  const names = calendarNames(locale);

  const today = now();

  const { min, max } = dateRange(today, minDate, maxDate);

  const value$ = toObservable(value);

  // `constant` takes no `undefined`, so an end never given is a state never set.
  const [noBoundary$] = createState<Boundary | undefined>(undefined);

  const boundary$ =
    boundaryToModify === undefined
      ? noBoundary$
      : toObservable(boundaryToModify);

  // What a press on the day under the pointer would make: `hoverValue`.
  const [hover$, setHover] = createState<DayRange | undefined>(undefined);

  const [display$, setDisplay] = createState(
    initialMonth(value$.getSnapshot().value, min, max, today),
  );

  const afterUpdate = createAfterUpdate();

  // The month shown follows the value, as Blueprint's `useContiguousCalendarViews`
  // for one month; written once the update that brought it has finished.
  const mut_previous: { range: DayRange } = {
    range: value$.getSnapshot().value,
  };

  value$.subscribe((range) => {
    const previous = mut_previous.range;

    mut_previous.range = range;

    // Blueprint's `areRangesEqual`: the same days, as a new array or not.
    if (previous[0] === range[0] && previous[1] === range[1]) {
      return;
    }

    afterUpdate(() => {
      setDisplay(monthFollowing(display$.getSnapshot().value, previous, range));
    });
  });

  /** Draws what a press on `day` would make, and returns it. */
  const enter = (day: WallClock): DayRange => {
    const { range, boundary } = nextRangeState(
      value$.getSnapshot().value,
      toDateValue(day),
      allowSingleDayRange,
      boundary$.getSnapshot().value,
    );

    setHover(range);

    onHoverChange?.(range, toDateValue(day), boundary);

    return range;
  };

  // Blueprint's `handleDayRangeSelect`: the range made is drawn as hovered
  // until the pointer moves again.
  const pick = (day: WallClock): void => {
    onChange(enter(day));
  };

  const leave = (day: WallClock): void => {
    setHover(undefined);

    onHoverChange?.(undefined, toDateValue(day), undefined);
  };

  // The value and the range under the pointer, for every day's marks.
  const drawn$ = derive(
    [value$, hover$],
    (range, hover) => [range, hover] as const,
  );

  const dayState = (day: WallClock): CalendarDayState => {
    const key = toDateValue(day);

    // The day's marks as one string, so that its classes are worked out again
    // only when the marks change (`map`'s equality cut-off), not on every move
    // of the pointer.
    const marks$ = drawn$.pipe(
      map(([range, hover]) => marksOf(range, hover, key)),
    );

    const has = (mark: DayMark): Bindable<boolean> =>
      marks$.pipe(map((marks) => marks.split(' ').includes(mark)));

    return {
      selected: has('selected'),
      classes: {
        'rdp-day_range_start': has('start'),
        'rdp-day_range_middle': has('middle'),
        'rdp-day_range_end': has('end'),
        'rdp-day_hovered': has('hovered'),
        'rdp-day_hovered_start': has('hoveredStart'),
        'rdp-day_hovered_end': has('hoveredEnd'),
      },
    };
  };

  return (
    <div
      class={constant(
        [
          'bp6-datepicker',
          'bp6-daterangepicker',
          ...(highlightCurrentDay
            ? ['bp6-datepicker-highlight-current-day']
            : []),
          'bp6-daterangepicker-contiguous',
          'bp6-daterangepicker-single-month',
        ].join(' '),
      )}
    >
      <div class={constant('bp6-datepicker-content')}>
        <Calendar
          changeMonth={(index) => {
            // A year picked keeps the month, which may be out of range there.
            setDisplay(Num.clamp(index, monthIndexOf(min), monthIndexOf(max)));
          }}
          dayState={dayState}
          display$={display$}
          focusCandidates$={value$.pipe(
            map((range) =>
              Arr.generate(function* () {
                for (const end of range) {
                  const clock = parseWallClock(end);

                  if (Optional.isSome(clock)) {
                    yield clock.value;
                  }
                }
              }),
            ),
          )}
          labels={labels}
          max={max}
          min={min}
          names={names}
          today={today}
          weekStartsOn={weekStartsOn}
          onDayClick={pick}
          onDayMouseEnter={enter}
          onDayMouseLeave={leave}
        />
      </div>
    </div>
  );
};

/** A modifier of a day drawn by a class. */
type DayMark =
  | 'end'
  | 'hovered'
  | 'hoveredEnd'
  | 'hoveredStart'
  | 'middle'
  | 'selected'
  | 'start';

const DAY_MS = 86_400_000;

/** react-day-picker's range modifiers of `day` for the range picked. */
const selectionOf = (
  [start, end]: DayRange,
  day: string,
): Readonly<{
  selected: boolean;
  start: boolean;
  middle: boolean;
  end: boolean;
}> => {
  // A range with one end only is drawn as that one day.
  const only = start === '' ? end : end === '' ? start : undefined;

  if (only !== undefined) {
    return only === day
      ? { selected: true, start: true, middle: false, end: true }
      : { selected: false, start: false, middle: false, end: false };
  }

  return {
    selected: start <= day && day <= end,
    start: start === day,
    middle: start < day && day < end,
    end: end === day,
  };
};

/**
 * Blueprint's hovered-range modifiers of `day`: its ends always, the days
 * between only while something is picked.
 */
const hoverOf = (
  [start, end]: DayRange,
  hover: DayRange | undefined,
  day: string,
): Readonly<{ inside: boolean; start: boolean; end: boolean }> =>
  hover === undefined
    ? ({ inside: false, start: false, end: false } as const)
    : ({
        inside:
          (start !== '' || end !== '') &&
          hover[0] !== '' &&
          hover[1] !== '' &&
          hover[0] < day &&
          day < hover[1],
        start: hover[0] === day,
        end: hover[1] === day,
      } as const);

/** The marks of `day`, joined by spaces. */
const marksOf = (
  range: DayRange,
  hover: DayRange | undefined,
  day: string,
): string => {
  const selection = selectionOf(range, day);

  const hovered = hoverOf(range, hover, day);

  return (
    [
      ['selected', selection.selected],
      ['start', selection.start],
      ['middle', selection.middle],
      ['end', selection.end],
      ['hovered', hovered.inside],
      ['hoveredStart', hovered.start],
      ['hoveredEnd', hovered.end],
    ] as const satisfies readonly (readonly [DayMark, boolean])[]
  )
    .filter(([, on]) => on)
    .map(([mark]) => mark)
    .join(' ');
};

/** Blueprint's `getDateBetween`: the day half way from `min` to `max`. */
const dayBetween = (min: WallClock, max: WallClock): WallClock => {
  const days = Math.round(
    (localNoon(max.year, max.month, max.day).getTime() -
      localNoon(min.year, min.month, min.day).getTime()) /
      DAY_MS,
  );

  return addDays(min, Math.floor(days / 2));
};

/** Blueprint's `getInitialMonth` for one month. */
const initialMonth = (
  [start, end]: DayRange,
  min: WallClock,
  max: WallClock,
  today: WallClock,
): number => {
  const startClock = parseWallClock(start);

  if (Optional.isSome(startClock)) {
    return monthIndexOf(startClock.value);
  }

  const endClock = parseWallClock(end);

  if (Optional.isSome(endClock)) {
    const index = monthIndexOf(endClock.value);

    return index === monthIndexOf(min) ? index : index - 1;
  }

  return isDayInRange(today, min, max)
    ? monthIndexOf(today)
    : monthIndexOf(dayBetween(min, max));
};

const monthOf = (day: string): number | undefined => {
  const clock = parseWallClock(day);

  return Optional.isSome(clock) ? monthIndexOf(clock.value) : undefined;
};

/**
 * The month shown once the value has gone from `previous` to `range`: Blueprint's
 * `useContiguousCalendarViews` for one month.
 */
const monthFollowing = (
  shown: number,
  previous: DayRange,
  [start, end]: DayRange,
): number => {
  const startMonth = monthOf(start);

  const endMonth = monthOf(end);

  if (
    (start === '' || end === '') &&
    (startMonth === shown || endMonth === shown)
  ) {
    return shown;
  }

  if (startMonth === undefined) {
    return endMonth === undefined || endMonth === shown + 1
      ? shown
      : endMonth - 1;
  }

  if (endMonth === undefined) {
    return startMonth;
  }

  if (startMonth === endMonth) {
    return shown === startMonth ? shown : startMonth;
  }

  // The start kept: the end is what changed.
  return previous[0] === start ? endMonth : startMonth;
};
