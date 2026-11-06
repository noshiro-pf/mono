import { createState, derive, map, onScopeDispose } from 'synstate';
import {
  constant,
  If,
  isImeKeyDown,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { StrictOmit } from 'ts-type-forge';
import {
  dateRange,
  formatDateText,
  isDayInRange,
  monthIndexOf,
  now,
  parseDateText,
  parseWallClock,
  toDateTimeValue,
  toDateValue,
  type WallClock,
} from '../date/index.mjs';
import { focusablesIn, isInside, uniqueId } from '../internal/index.mjs';
import {
  DatePicker,
  type DatePickerOptions,
  type DatePickerShortcut,
} from './date-picker.js';
import { DatePopover } from './date-popover-parts.js';

type Props = StrictOmit<DatePickerOptions, 'shortcuts'> &
  Readonly<{
    /**
     * Drawn in a menu before the calendar; none if omitted. A function is
     * called each time the calendar opens, for shortcuts counted from the day
     * it opens on, and draws none that time when it returns `undefined`.
     */
    shortcuts?:
      | readonly DatePickerShortcut[]
      | (() => readonly DatePickerShortcut[] | undefined);
    /**
     * `YYYY-MM-DDTHH:mm` with a `timePrecision`, `YYYY-MM-DD` without, and `''`
     * for none.
     */
    value: Bindable<string>;
    onChange: (value: string) => void;
    /** The id of the text input, for a `<label>`. */
    id?: string;
    placeholder?: string;
    /** Takes the width of its container (`bp6-fill`). */
    fill?: boolean;
    disabled?: Bindable<boolean>;
    /** Closes the calendar once a day is picked; `true` by default. */
    closeOnSelection?: boolean;
    /**
     * The text input's `inputmode`. `'none'` keeps a phone's keyboard from
     * covering the calendar; a hardware keyboard still types a date.
     */
    inputMode?: string;
    /** Called when the text input takes the focus. */
    onInputFocus?: (input: HTMLInputElement) => void;
    /** The text shown for a value; `yyyy/MM/dd HH:mm` if omitted. */
    formatDate?: (clock: WallClock) => string;
    /** The value read from typed text; {@link parseDateText} if omitted. */
    parseDate?: (text: string) => Optional<WallClock>;
    invalidDateMessage?: string;
    outOfRangeMessage?: string;
  }>;

/**
 * Blueprint's `DateInput`: a text input that opens a {@link DatePicker} in a
 * popover hanging below it, in Blueprint's markup.
 *
 * The popover is drawn in place, after the input, rather than in a portal, and
 * positioned `fixed`: inside a modal `<dialog>`, which is in the top layer, a
 * portal on `<body>` would be drawn behind the dialog and be inert.
 * In place it is inside the dialog, and is not clipped by a scrolling body.
 *
 * It behaves as Blueprint's does with a controlled value:
 *
 * - Focusing the input opens the calendar; Escape or a press outside closes
 *   it. Tab from the input goes into the calendar, and tabbing past its end
 *   comes back to the input and closes it.
 * - While focused, the input shows what is typed; text that reads as a date
 *   in range becomes the value as it is typed, and Enter takes any date it
 *   reads. Otherwise it shows the value, or the error message for a value
 *   that is not a date or is out of range, drawn as an error.
 * - Picking a day closes the calendar with `closeOnSelection`, unless the
 *   month or the time changed with it.
 *
 * Unlike Blueprint's, Escape while the calendar is open is kept from the page,
 * so that the `<dialog>` it is in stays open and the next Escape closes it.
 */
export const DateInput = ({
  value,
  onChange,
  id,
  placeholder,
  fill = false,
  disabled,
  closeOnSelection = true,
  inputMode,
  onInputFocus,
  formatDate,
  parseDate,
  invalidDateMessage = 'Invalid date',
  outOfRangeMessage = 'Out of range',
  shortcuts,
  ...pickerOptions
}: Props): JSX.Element => {
  const { timePrecision } = pickerOptions;

  const { min, max } = dateRange(
    now(),
    pickerOptions.minDate,
    pickerOptions.maxDate,
  );

  const format =
    formatDate ?? ((clock: WallClock) => formatDateText(clock, timePrecision));

  const parse =
    parseDate ?? ((text: string) => parseDateText(text, timePrecision));

  const toValue = (clock: WallClock): string =>
    timePrecision === 'minute' ? toDateTimeValue(clock) : toDateValue(clock);

  const popoverId = uniqueId('date-picker');

  const value$ = toObservable(value);

  const shown$ = value$.pipe(
    map((current): Shown => {
      if (current === '') {
        return { text: '', error: false };
      }

      const clock = parseWallClock(current);

      return Optional.isNone(clock)
        ? { text: invalidDateMessage, error: true }
        : isDayInRange(clock.value, min, max)
          ? { text: format(clock.value), error: false }
          : { text: outOfRangeMessage, error: true };
    }),
  );

  const [isOpen$, setOpen] = createState(false);

  // The shortcut picked last, drawn as picked each time the calendar opens, as
  // Blueprint's `DateInput` keeps it.
  const [shortcutIndex$, setShortcutIndex] = createState(-1);

  const [focused$, setFocused] = createState(false);

  // What the input shows while it has the focus.
  const [typed$, setTyped] = createState('');

  const disabled$ = toObservable(disabled ?? constant(false));

  const open$ = derive(
    [isOpen$, disabled$],
    (isOpen, isDisabled) => isOpen && !isDisabled,
  );

  const text$ = derive([focused$, typed$, shown$], (focused, typed, shown) =>
    focused ? typed : shown.text,
  );

  const targetClass$ = derive(
    [open$, shown$, focused$, typed$, disabled$],
    (open, shown, focused, typed, isDisabled) =>
      [
        'bp6-input-group',
        ...(fill ? ['bp6-fill'] : []),
        ...(isDisabled ? ['bp6-disabled'] : []),
        // Blueprint's `shouldShowErrorStyling`: not while a correction is being
        // typed.
        ...(shown.error &&
        (!focused ||
          typed === invalidDateMessage ||
          typed === outOfRangeMessage)
          ? ['bp6-intent-danger']
          : []),
        'bp6-date-input',
        'bp6-popover-target',
        ...(open ? ['bp6-popover-open'] : []),
      ].join(' '),
  );

  const mut_elements: {
    target: HTMLDivElement | undefined;
    input: HTMLInputElement | undefined;
    content: HTMLDivElement | undefined;
    // The next focus of the input comes from closing the calendar, and does not
    // open it again.
    suppressOpen: boolean;
  } = {
    target: undefined,
    input: undefined,
    content: undefined,
    suppressOpen: false,
  };

  const focusInput = (close: boolean): void => {
    if (close) {
      mut_elements.suppressOpen = true;

      setOpen(false);
    }

    mut_elements.input?.focus();

    mut_elements.suppressOpen = false;
  };

  // What Tab reaches in the calendar, its two ends left out.
  const focusables = (): readonly HTMLElement[] =>
    focusablesIn(mut_elements.content).slice(1, -1);

  const changeFromPicker = (next: string, viaEnter: boolean): void => {
    const nextClock = parseWallClock(next);

    if (Optional.isNone(nextClock)) {
      onChange('');

      return;
    }

    const previous = parseWallClock(value$.getSnapshot().value);

    const stayOpen =
      !closeOnSelection ||
      (Optional.isSome(previous) &&
        (monthIndexOf(previous.value) !== monthIndexOf(nextClock.value) ||
          (timePrecision === 'minute' &&
            (previous.value.hour !== nextClock.value.hour ||
              previous.value.minute !== nextClock.value.minute))));

    setOpen(stayOpen);

    // A press on the calendar has taken the focus from the input, except in
    // Safari, which does not focus a button that is pressed.
    const stillFocused =
      viaEnter || document.activeElement === mut_elements.input;

    setFocused(stillFocused);

    if (stillFocused) {
      setTyped(format(nextClock.value));
    }

    onChange(next);
  };

  const Overlay = (): JSX.Element => (
    <DatePopover
      getTarget={() => mut_elements.target}
      popoverClass={'bp6-date-input-popover'}
      onEscape={() => {
        focusInput(true);
      }}
      onOutsidePress={() => {
        setOpen(false);
      }}
    >
      <div
        ref={(content) => {
          mut_elements.content = content;

          onScopeDispose(() => {
            mut_elements.content = undefined;
          });
        }}
        aria-label={constant('date picker')}
        id={constant(popoverId)}
        role={constant('dialog')}
      >
        <div
          tabIndex={constant(0)}
          onFocus={(event) => {
            if (isInside(event.relatedTarget, mut_elements.content)) {
              focusInput(false);
            } else {
              focusables()[0]?.focus();
            }
          }}
        />
        <DatePicker
          {...pickerOptions}
          shortcuts={typeof shortcuts === 'function' ? shortcuts() : shortcuts}
          selectedShortcutIndex={shortcutIndex$}
          onShortcutChange={setShortcutIndex}
          value={derive([value$, shown$], (current, shown) =>
            shown.error ? '' : current,
          )}
          onChange={(next) => {
            changeFromPicker(next, false);
          }}
        />
        <div
          tabIndex={constant(0)}
          onFocus={(event) => {
            if (isInside(event.relatedTarget, mut_elements.content)) {
              focusInput(true);
            } else {
              focusables().at(-1)?.focus();
            }
          }}
        />
      </div>
    </DatePopover>
  );

  return (
    <>
      <div
        ref={(target) => {
          mut_elements.target = target;
        }}
        class={targetClass$}
      >
        <input
          ref={(input) => {
            mut_elements.input = input;
          }}
          aria-controls={constant(popoverId)}
          aria-expanded={open$.pipe(map(String))}
          aria-haspopup={constant('menu')}
          autocomplete={constant('off')}
          class={constant('bp6-input')}
          disabled={disabled$}
          id={id === undefined ? undefined : constant(id)}
          inputMode={inputMode === undefined ? undefined : constant(inputMode)}
          placeholder={
            placeholder === undefined ? undefined : constant(placeholder)
          }
          role={constant('combobox')}
          type={constant('text')}
          value={text$}
          onBlur={() => {
            setFocused(false);
          }}
          onClick={() => {
            setOpen(true);
          }}
          onFocus={(event) => {
            setTyped(shown$.getSnapshot().value.text);

            setFocused(true);

            if (!mut_elements.suppressOpen) {
              setOpen(true);
            }

            onInputFocus?.(event.currentTarget);
          }}
          onInput={(event) => {
            const text = event.currentTarget.value;

            setTyped(text);

            if (text === '') {
              onChange('');

              return;
            }

            const clock = parse(text);

            if (Optional.isSome(clock) && isDayInRange(clock.value, min, max)) {
              onChange(toValue(clock.value));
            }
          }}
          onKeyDown={(event) => {
            // Keys that pick, confirm or cancel what an input method is
            // composing.
            if (isImeKeyDown(event)) {
              return;
            }

            const isOpen = open$.getSnapshot().value;

            switch (event.key) {
              case 'Tab': {
                if (event.shiftKey) {
                  setOpen(false);

                  break;
                }

                const first = isOpen ? focusables()[0] : undefined;

                if (first !== undefined) {
                  event.preventDefault();

                  first.focus();
                }

                break;
              }

              case 'Escape':
                if (isOpen) {
                  event.preventDefault();
                }

                setOpen(false);

                event.currentTarget.blur();

                break;

              case 'Enter': {
                const clock = parse(typed$.getSnapshot().value);

                if (Optional.isSome(clock)) {
                  changeFromPicker(toValue(clock.value), true);
                }

                break;
              }

              default:
                break;
            }
          }}
        />
      </div>
      <If cond={open$} then={<Overlay />} />
    </>
  );
};

type Shown = Readonly<{ text: string; error: boolean }>;
