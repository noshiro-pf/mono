import { createState, derive, map } from 'synstate';
import {
  constant,
  createAfterUpdate,
  If,
  isImeKeyDown,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  addDays,
  dateRange,
  formatDateText,
  isDayInRange,
  now,
  parseDateText,
  parseWallClock,
  toDateValue,
  type WallClock,
} from '../date/index.mjs';
import {
  classObject,
  endOf,
  otherOf,
  type Boundary,
  type DayRange,
} from '../internal/index.mjs';
import { DatePopover } from './date-popover-parts.js';
import {
  DateRangePicker,
  type DateRangePickerOptions,
} from './date-range-picker.js';

/** What may be set on each of the two text inputs. */
export type DateRangeInputFieldProps = Readonly<{
  /** The id of the text input, for a `<label>`. */
  id?: string;
  /** Shown while empty, focused or not, in place of Blueprint's. */
  placeholder?: string;
  /** Classes after Blueprint's own on the field's `div.bp6-input-group`. */
  class?: string;
}>;

type Props = DateRangePickerOptions &
  Readonly<{
    /** The days, each `YYYY-MM-DD` or `''` for none. */
    value: Bindable<DayRange>;
    onChange: (value: DayRange) => void;
    disabled?: Bindable<boolean>;
    /** Takes the width of its container (`bp6-fill`). */
    fill?: boolean;
    /** Closes the calendar once both days are picked; `true` by default. */
    closeOnSelection?: boolean;
    /** Selects the whole text of a field as it takes the focus. */
    selectAllOnFocus?: boolean;
    startInputProps?: DateRangeInputFieldProps;
    endInputProps?: DateRangeInputFieldProps;
    /** The text shown for a day; `yyyy/MM/dd` if omitted. */
    formatDate?: (clock: WallClock) => string;
    /** The day read from typed text; {@link parseDateText} if omitted. */
    parseDate?: (text: string) => Optional<WallClock>;
    invalidDateMessage?: string;
    outOfRangeMessage?: string;
    /** Shown in the end field for an end before the start. */
    overlappingDatesMessage?: string;
  }>;

/**
 * Blueprint's `DateRangeInput` showing one month (`singleMonthOnly`) and no
 * shortcuts, with a controlled value of days: two text inputs in a
 * `bp6-control-group` that open a {@link DateRangePicker} in a popover hanging
 * below them, in Blueprint's markup.
 *
 * It behaves as Blueprint's does:
 *
 * - Focusing either field opens the calendar, and a press on a day changes the
 *   end of that field, or starts and finishes a range when the field was
 *   focused by moving over the calendar. While the pointer is over a day, the
 *   fields show the range a press would make, and the focus moves to the end
 *   it would change.
 * - Text typed that reads as a day in range, not passing the other end,
 *   becomes that end as it is typed; Enter takes any day it reads. Tab moves
 *   from the start field to the end field, and from the end field out,
 *   closing the calendar; Escape closes it.
 * - With the whole text of a field selected, the arrow keys move its day, by
 *   a day or a week, keeping it from passing the other end.
 * - A field shows the error message for a day not a date or out of range, and
 *   the end field one before the start, drawn as an error.
 *
 * Unlike Blueprint's, the popover is drawn in place, as {@link DateInput}'s is;
 * Escape in the calendar is kept from the page, and gives the focus back to the
 * field it was opened from without opening it again (one pressed elsewhere only
 * closes it, as Blueprint's); and Enter on text that reads as no date changes
 * nothing, where Blueprint's passes on an invalid `Date`.
 */
export const DateRangeInput = ({
  value,
  onChange,
  disabled,
  fill = false,
  closeOnSelection = true,
  selectAllOnFocus = false,
  startInputProps,
  endInputProps,
  formatDate,
  parseDate,
  invalidDateMessage = 'Invalid date',
  outOfRangeMessage = 'Out of range',
  overlappingDatesMessage = 'Overlapping dates',
  ...pickerOptions
}: Props): JSX.Element => {
  const { allowSingleDayRange = false } = pickerOptions;

  const { min, max } = dateRange(
    now(),
    pickerOptions.minDate,
    pickerOptions.maxDate,
  );

  const format =
    formatDate ?? ((clock: WallClock) => formatDateText(clock, undefined));

  const parse = parseDate ?? ((text: string) => parseDateText(text, undefined));

  const value$ = toObservable(value);

  const disabled$ = toObservable(disabled ?? constant(false));

  const [state$, setState] = createState<State>(initialState);

  const current = (): State => Optional.unwrap(state$.getSnapshot());

  const open$ = derive(
    [state$, disabled$],
    (state, isDisabled) => state.open && !isDisabled,
  );

  const mut_elements: {
    target: HTMLDivElement | undefined;
    start: HTMLInputElement | undefined;
    end: HTMLInputElement | undefined;
    popover: HTMLElement | undefined;
  } = {
    target: undefined,
    start: undefined,
    end: undefined,
    popover: undefined,
  };

  /** Whether a day of the calendar open below has the focus. */
  const isDayFocused = (): boolean => {
    const active = document.activeElement;

    return (
      active instanceof HTMLButtonElement &&
      active.classList.contains('rdp-day') &&
      mut_elements.popover?.contains(active) === true
    );
  };

  const inputOf = (boundary: Boundary): HTMLInputElement | undefined =>
    boundary === 'start' ? mut_elements.start : mut_elements.end;

  /** `day` read, if it is a day in range. */
  const inRange = (day: string): Optional<WallClock> =>
    Optional.filter(parseWallClock(day), (clock) =>
      isDayInRange(clock, min, max),
    );

  /** Blueprint's `isDateValidAndInRange`. */
  const isValidInRange = (day: string): boolean =>
    Optional.isSome(inRange(day));

  /** Blueprint's `formatDate`: the text of a day in range, `''` otherwise. */
  const textOf = (day: string): string => {
    const clock = inRange(day);

    return Optional.isSome(clock) ? format(Optional.unwrap(clock)) : '';
  };

  /** Blueprint's `formatDateString`. */
  const shownOf = (day: string, ignoreRange: boolean): string => {
    if (day === '') {
      return '';
    }

    const clock = parseWallClock(day);

    return Optional.isNone(clock)
      ? invalidDateMessage
      : ignoreRange || isDayInRange(Optional.unwrap(clock), min, max)
        ? format(Optional.unwrap(clock))
        : outOfRangeMessage;
  };

  /**
   * Blueprint's `parseDate`: `''` for no text to read, the day read, or
   * {@link INVALID_DAY}.
   */
  const dayOfText = (text: string | undefined): string => {
    if (
      text === undefined ||
      text === outOfRangeMessage ||
      text === invalidDateMessage
    ) {
      return '';
    }

    const clock = parse(text);

    return Optional.isSome(clock)
      ? toDateValue(Optional.unwrap(clock))
      : INVALID_DAY;
  };

  /** Blueprint's `doBoundaryDatesOverlap`, against the value's other end. */
  const overlaps = (
    day: string,
    boundary: Boundary,
    range: DayRange,
  ): boolean => {
    const other = endOf(otherOf(boundary), range);

    if (
      Optional.isNone(parseWallClock(day)) ||
      Optional.isNone(parseWallClock(other))
    ) {
      return false;
    }

    return (
      (boundary === 'start' ? day > other : day < other) ||
      (!allowSingleDayRange && day === other)
    );
  };

  /** Blueprint's `getDateRangeForCallback`. */
  const rangeWith = (day: string, boundary: Boundary): DayRange => {
    const other = endOf(
      otherOf(boundary),
      Optional.unwrap(value$.getSnapshot()),
    );

    return boundary === 'start' ? [day, other] : [other, day];
  };

  const isNextRangeValid = (day: string, boundary: Boundary): boolean =>
    isValidInRange(day) &&
    !overlaps(day, boundary, Optional.unwrap(value$.getSnapshot()));

  /** Blueprint's `getSelectedRange`: what the calendar is given. */
  const selectedRange = (range: DayRange): DayRange => {
    const [start, end] = range;

    const shownEnd = overlaps(start, 'start', range) ? '' : end;

    return [
      isValidInRange(start) ? start : '',
      isValidInRange(shownEnd) ? shownEnd : '',
    ];
  };

  const afterUpdate = createAfterUpdate();

  const mut_sync: {
    pending: boolean;
    // The next focus of a field gives the focus back as the calendar closes,
    // and does not open it again.
    suppressOpen: boolean;
    // The field the calendar was opened from, as Blueprint's popover keeps the
    // element focused as it opened.
    openedFrom: Boundary;
  } = { pending: false, suppressOpen: false, openedFrom: 'start' };

  /**
   * What Blueprint's `componentDidUpdate` does: moves the focus to the field
   * the state says has it, and selects its text when asked to.
   */
  const syncFocus = (): void => {
    mut_sync.pending = false;

    const state = current();

    const field = state.start.focused
      ? mut_elements.start
      : state.end.focused
        ? mut_elements.end
        : undefined;

    if (field !== undefined && document.activeElement !== field) {
      if (isDayFocused()) {
        // react-day-picker gives the focus back to the day it has whenever the
        // calendar is drawn again, so in Blueprint's the field has it only for
        // a moment: its state goes through the field's focus and blur, and the
        // day keeps the focus.
        const boundary = field === mut_elements.start ? 'start' : 'end';

        focusField(boundary);

        blurField(boundary);
      } else {
        field.focus();
      }
    }

    if (state.shouldSelectAfterUpdate) {
      field?.select();
    }
  };

  /**
   * Sets the state, and syncs the focus with it once the handler has returned,
   * as React does after the updates of one event.
   */
  const update = (next: State): void => {
    setState(next);

    if (mut_sync.pending) {
      return;
    }

    mut_sync.pending = true;

    afterUpdate(syncFocus);
  };

  // Callbacks of the calendar.

  const changeFromPicker = (range: DayRange, viaEnter: boolean): void => {
    const state = current();

    // Blueprint's takes no change while closed, Enter in a field included.
    if (!state.open) {
      return;
    }

    const [start, end] = range;

    const isStartPicked = start !== '';

    const isEndPicked = end !== '';

    // Blueprint's: the end still to be picked takes the focus; once both are,
    // the calendar closes with `closeOnSelection`, the focus staying in the end
    // field after Enter, and otherwise the field last focused keeps it.
    const closes = isStartPicked && isEndPicked && closeOnSelection;

    const keepsStart =
      isEndPicked && !closeOnSelection && state.lastFocusedField === 'start';

    const startFocused = !isStartPicked || keepsStart;

    const endFocused =
      isStartPicked && (!isEndPicked || (closes ? viaEnter : !keepsStart));

    update({
      ...state,
      open: !closes,
      boundaryToModify: closes && !viaEnter ? 'end' : undefined,
      wasLastFocusChangeDueToHover: false,
      // What the pointer shows is hidden until it moves over another day.
      start: { focused: startFocused, input: textOf(start), hover: undefined },
      end: { focused: endFocused, input: textOf(end), hover: undefined },
    });

    onChange(range);
  };

  const hoverFromPicker = (
    range: DayRange | undefined,
    boundary: Boundary | undefined,
  ): void => {
    const state = current();

    if (!state.open) {
      return;
    }

    if (range === undefined) {
      // Undoes the focus moves made while over the calendar.
      const backToEnd = state.boundaryToModify === 'end';

      update({
        ...state,
        lastFocusedField: state.boundaryToModify,
        start: { ...state.start, focused: !backToEnd, hover: undefined },
        end: { ...state.end, focused: backToEnd, hover: undefined },
      });

      return;
    }

    const startFocused =
      boundary === undefined ? state.start.focused : boundary === 'start';

    const endFocused =
      boundary === undefined ? state.end.focused : boundary === 'end';

    update({
      ...state,
      lastFocusedField: startFocused ? 'start' : 'end',
      shouldSelectAfterUpdate: selectAllOnFocus,
      wasLastFocusChangeDueToHover: true,
      start: { ...state.start, focused: startFocused, hover: textOf(range[0]) },
      end: { ...state.end, focused: endFocused, hover: textOf(range[1]) },
    });
  };

  // Callbacks of the fields.

  const focusField = (boundary: Boundary): void => {
    const state = current();

    if (!state.open && !mut_sync.suppressOpen) {
      mut_sync.openedFrom = boundary;
    }

    update(
      withField(
        {
          ...state,
          // Only a focus the person moved changes the end a press changes;
          // one moved by the pointer over the calendar does not.
          boundaryToModify: state.wasLastFocusChangeDueToHover
            ? state.boundaryToModify
            : boundary,
          open: !mut_sync.suppressOpen || state.open,
          lastFocusedField: boundary,
          shouldSelectAfterUpdate: selectAllOnFocus,
          wasLastFocusChangeDueToHover: false,
        },
        boundary,
        {
          focused: true,
          input: shownOf(
            endOf(boundary, Optional.unwrap(value$.getSnapshot())),
            true,
          ),
        },
      ),
    );
  };

  const blurField = (boundary: Boundary): void => {
    const state = current();

    const field = fieldOf(state, boundary);

    update(
      withField({ ...state, shouldSelectAfterUpdate: false }, boundary, {
        focused: false,
        ...(field.input === undefined || field.input === ''
          ? {
              input: shownOf(
                endOf(boundary, Optional.unwrap(value$.getSnapshot())),
                false,
              ),
            }
          : {}),
      }),
    );
  };

  const typeField = (boundary: Boundary, text: string): void => {
    const state = { ...current(), shouldSelectAfterUpdate: false } as const;

    if (text === '') {
      update(withField(state, boundary, { input: '' }));

      onChange(rangeWith('', boundary));

      return;
    }

    // Clears what the pointer over the calendar shows, so that the text typed
    // is seen.
    update(withField(state, boundary, { input: text, hover: undefined }));

    const day = dayOfText(text);

    if (isNextRangeValid(day, boundary)) {
      onChange(rangeWith(day, boundary));
    }
  };

  const moveByArrow = (
    event: KeyboardEvent,
    boundary: Boundary,
    key: ArrowKey,
  ): void => {
    const state = current();

    const input = inputOf(boundary);

    // Blueprint's `isEntireInputSelected`.
    const isEntireTextSelected =
      input?.selectionStart === 0 && input.selectionEnd === input.value.length;

    if (!isEntireTextSelected || !Optional.unwrap(open$.getSnapshot())) {
      return;
    }

    const [start, end] = selectedRange(Optional.unwrap(value$.getSnapshot()));

    const shifted =
      nextDayByArrow(start, end, boundary, key, allowSingleDayRange) ??
      defaultDayByArrow(start, end, boundary, key);

    if (shifted === undefined) {
      return;
    }

    event.preventDefault();

    const clamped = clampDayValue(shifted, toDateValue(min), toDateValue(max));

    onChange(rangeWith(clamped, boundary));

    update(
      withField({ ...state, shouldSelectAfterUpdate: true }, boundary, {
        input: textOf(clamped),
      }),
    );
  };

  const keyDown = (event: KeyboardEvent, boundary: Boundary): void => {
    // Keys that pick, confirm or cancel what an input method is composing.
    if (isImeKeyDown(event)) {
      return;
    }

    if (isArrowKey(event.key)) {
      moveByArrow(event, boundary, event.key);

      return;
    }

    const state = current();

    if (event.key === 'Escape') {
      if (Optional.unwrap(open$.getSnapshot())) {
        event.preventDefault();
      }

      mut_elements.start?.blur();

      mut_elements.end?.blur();

      update({
        ...current(),
        open: false,
        start: { ...current().start, focused: false },
        end: { ...current().end, focused: false },
      });

      return;
    }

    // Tabbing fires this between the blur of one field and the focus of the
    // next, so the field last focused is the one the key was pressed in.
    const last = state.lastFocusedField;

    if (event.key === 'Tab') {
      const toEnd = last === 'start' && !event.shiftKey;

      const toStart = last === 'end' && event.shiftKey;

      if (toEnd || toStart) {
        // The focus is moved by `update`.
        event.preventDefault();
      }

      update({
        ...state,
        open: toEnd || toStart,
        wasLastFocusChangeDueToHover: false,
        start: { ...state.start, focused: toStart },
        end: { ...state.end, focused: toEnd },
      });

      return;
    }

    if (last === undefined || event.key !== 'Enter') {
      return;
    }

    const day = dayOfText(fieldOf(state, last).input);

    if (day === INVALID_DAY) {
      return;
    }

    const [start, end] = Optional.unwrap(value$.getSnapshot());

    changeFromPicker(last === 'start' ? [day, end] : [start, day], true);
  };

  // What each field draws.

  const fieldView = (boundary: Boundary): FieldView => {
    const shown$ = derive([state$, value$], (state, range): Shown => {
      const field = fieldOf(state, boundary);

      const selected = endOf(boundary, range);

      const endOverlaps = (day: string): boolean =>
        boundary === 'end' && overlaps(day, boundary, range);

      const text =
        field.hover ??
        (field.focused
          ? (field.input ?? '')
          : selected === ''
            ? ''
            : endOverlaps(selected)
              ? overlappingDatesMessage
              : shownOf(selected, false));

      // Blueprint's `isInputInErrorState`: not while over a day, nor while the
      // field has had no text.
      const checked = field.focused ? dayOfText(field.input) : selected;

      const error =
        field.hover === undefined &&
        field.input !== undefined &&
        field.input !== '' &&
        checked !== '' &&
        (!isValidInRange(checked) || endOverlaps(checked));

      return {
        text,
        error,
        placeholder: field.focused
          ? shownOf(toDateValue(boundary === 'start' ? min : max), false)
          : boundary === 'start'
            ? 'Start date'
            : 'End date',
      };
    });

    return {
      text: shown$.pipe(map((shown) => shown.text)),
      error: shown$.pipe(map((shown) => shown.error)),
      placeholder: shown$.pipe(map((shown) => shown.placeholder)),
    };
  };

  const Field = ({
    boundary,
    props,
  }: Readonly<{
    boundary: Boundary;
    props: DateRangeInputFieldProps | undefined;
  }>): JSX.Element => {
    const shown = fieldView(boundary);

    return (
      <div
        class={classObject(
          ['bp6-input-group', fill && 'bp6-fill', props?.class],
          [
            ['bp6-intent-danger', shown.error],
            ['bp6-disabled', disabled$],
          ],
        )}
      >
        <input
          ref={(input) => {
            if (boundary === 'start') {
              mut_elements.start = input;
            } else {
              mut_elements.end = input;
            }
          }}
          autocomplete={constant('off')}
          class={constant('bp6-input')}
          disabled={disabled$}
          id={props?.id === undefined ? undefined : constant(props.id)}
          placeholder={
            props?.placeholder === undefined
              ? shown.placeholder
              : constant(props.placeholder)
          }
          type={constant('text')}
          value={shown.text}
          onBlur={() => {
            blurField(boundary);
          }}
          onClick={(event) => {
            // A field Escape gave the focus back to opens the calendar on a
            // press, as DateInput's does.
            if (
              !current().open &&
              document.activeElement === event.currentTarget
            ) {
              focusField(boundary);
            }
          }}
          onFocus={() => {
            focusField(boundary);
          }}
          onInput={(event) => {
            typeField(boundary, event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            keyDown(event, boundary);
          }}
          onMouseDown={() => {
            // A press in a field is a focus the person moved.
            update({ ...current(), wasLastFocusChangeDueToHover: false });
          }}
        />
      </div>
    );
  };

  /**
   * Closes the calendar. What the pointer showed goes with it, as no day is
   * left for it to leave; and a field the pointer moved the focus to, as it
   * does over the calendar, has it only if it really does: an Escape pressed
   * elsewhere closes the calendar with the pointer still over a day.
   */
  const closeCalendar = (): void => {
    update({
      ...current(),
      open: false,
      start: {
        ...current().start,
        focused: document.activeElement === mut_elements.start,
        hover: undefined,
      },
      end: {
        ...current().end,
        focused: document.activeElement === mut_elements.end,
        hover: undefined,
      },
    });
  };

  const Overlay = (): JSX.Element => (
    <DatePopover
      getTarget={() => mut_elements.target}
      containerRef={(container) => {
        mut_elements.popover = container;
      }}
      popoverClass={'bp6-date-range-input-popover'}
      onClose={closeCalendar}
      onEscape={() => {
        // Blueprint's popover gives the focus back to the field it was opened
        // from as Escape closes it, so that it is not lost with the calendar;
        // unlike Blueprint's, that focus does not open the calendar again.
        closeCalendar();

        mut_sync.suppressOpen = true;

        inputOf(mut_sync.openedFrom)?.focus();

        mut_sync.suppressOpen = false;
      }}
    >
      <DateRangePicker
        {...pickerOptions}
        boundaryToModify={state$.pipe(map((state) => state.boundaryToModify))}
        value={value$.pipe(map(selectedRange))}
        onChange={(range) => {
          changeFromPicker(range, false);
        }}
        onHoverChange={(range, _day, boundary) => {
          hoverFromPicker(range, boundary);
        }}
      />
    </DatePopover>
  );

  return (
    <>
      <div
        ref={(target) => {
          mut_elements.target = target;
        }}
        aria-expanded={open$}
        aria-haspopup={constant('menu')}
        class={{
          'bp6-control-group': constant(true),
          'bp6-date-range-input': constant(true),
          'bp6-popover-target': constant(true),
          'bp6-popover-open': open$,
          'bp6-fill': constant(fill),
        }}
      >
        <Field boundary={'start'} props={startInputProps} />
        <Field boundary={'end'} props={endInputProps} />
      </div>
      <If cond={open$} then={<Overlay />} />
    </>
  );
};

/** One field's part of Blueprint's state. */
type FieldState = Readonly<{
  /** Blueprint's `isStartInputFocused`: where the focus is, or is to go. */
  focused: boolean;
  /** What the field shows while focused; `undefined` before anything is. */
  input: string | undefined;
  /** The day a press on the calendar would give it, while over a day. */
  hover: string | undefined;
}>;

type State = Readonly<{
  open: boolean;
  start: FieldState;
  end: FieldState;
  boundaryToModify: Boundary | undefined;
  lastFocusedField: Boundary | undefined;
  wasLastFocusChangeDueToHover: boolean;
  shouldSelectAfterUpdate: boolean;
}>;

type Shown = Readonly<{ text: string; error: boolean; placeholder: string }>;

type FieldView = Readonly<{
  text: Bindable<string>;
  error: Bindable<boolean>;
  placeholder: Bindable<string>;
}>;

type ArrowKey = 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp';

const initialField: FieldState = {
  focused: false,
  input: undefined,
  hover: undefined,
} as const;

const initialState: State = {
  open: false,
  start: initialField,
  end: initialField,
  boundaryToModify: undefined,
  lastFocusedField: undefined,
  wasLastFocusChangeDueToHover: false,
  shouldSelectAfterUpdate: false,
} as const;

/** What typed text that reads as no date is taken for: Blueprint's invalid `Date`. */
const INVALID_DAY = 'invalid';

const fieldOf = (state: State, boundary: Boundary): FieldState =>
  boundary === 'start' ? state.start : state.end;

const withField = (
  state: State,
  boundary: Boundary,
  patch: Partial<FieldState>,
): State =>
  boundary === 'start'
    ? ({ ...state, start: { ...state.start, ...patch } } as const)
    : ({ ...state, end: { ...state.end, ...patch } } as const);

const isArrowKey = (key: string): key is ArrowKey =>
  key === 'ArrowDown' ||
  key === 'ArrowLeft' ||
  key === 'ArrowRight' ||
  key === 'ArrowUp';

const shiftDays = (day: string, days: number): string => {
  const clock = parseWallClock(day);

  return Optional.isSome(clock)
    ? toDateValue(addDays(Optional.unwrap(clock), days))
    : day;
};

/** Blueprint's `shiftDateByArrowKey`, on a valid `YYYY-MM-DD`. */
const shiftByArrow = (day: string, key: ArrowKey): string =>
  shiftDays(
    day,
    key === 'ArrowUp'
      ? -7
      : key === 'ArrowDown'
        ? 7
        : key === 'ArrowLeft'
          ? -1
          : 1,
  );

/** Blueprint's `clampDate`, on `YYYY-MM-DD` or `''` for no bound. */
const clampDayValue = (day: string, lowest: string, highest: string): string =>
  lowest !== '' && day < lowest
    ? lowest
    : highest !== '' && day > highest
      ? highest
      : day;

/** Blueprint's `getNextDateForArrowKeyNavigation`. */
const nextDayByArrow = (
  start: string,
  end: string,
  boundary: Boundary,
  key: ArrowKey,
  allowSingleDayRange: boolean,
): string | undefined => {
  const initial = boundary === 'start' ? start : end;

  if (initial === '') {
    return undefined;
  }

  const relative = shiftByArrow(initial, key);

  // Keeps it from making a range of one day where that is not allowed.
  return boundary === 'start'
    ? clampDayValue(
        relative,
        '',
        end === '' || allowSingleDayRange ? end : shiftDays(end, -1),
      )
    : clampDayValue(
        relative,
        start === '' || allowSingleDayRange ? start : shiftDays(start, 1),
        '',
      );
};

/** Blueprint's `getDefaultDateForArrowKeyNavigation`. */
const defaultDayByArrow = (
  start: string,
  end: string,
  boundary: Boundary,
  key: ArrowKey,
): string | undefined => {
  const other = boundary === 'start' ? end : start;

  if (other === '') {
    return toDateValue(now());
  }

  const isForward = key === 'ArrowRight' || key === 'ArrowDown';

  // Moving the way of the end it changes does not pass the other.
  return isForward === (boundary === 'end')
    ? shiftByArrow(other, key)
    : undefined;
};
