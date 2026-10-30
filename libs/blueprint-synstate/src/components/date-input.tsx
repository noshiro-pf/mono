import { createState, derive, map, onScopeDispose } from 'synstate';
import {
  constant,
  If,
  toObservable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
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
import {
  ARROW_SIZE,
  createAfterUpdate,
  listenInScope,
  placeBottomStart,
  uniqueId,
  type PopoverPosition,
} from '../internal/index.mjs';
import { DatePicker, type DatePickerOptions } from './date-picker.js';

type Props = DatePickerOptions &
  Readonly<{
    /**
     * `YYYY-MM-DDTHH:mm` with a `timePrecision`, `YYYY-MM-DD` without, and
     * `''` for none.
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
 * The popover is drawn in place, after the input, rather than in a portal,
 * and positioned `fixed`: inside a modal `<dialog>`, which is in the top
 * layer, a portal on `<body>` would be drawn behind the dialog and be inert.
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
 * Unlike Blueprint's, Escape while the calendar is open is kept from the
 * page, so that the `<dialog>` it is in stays open and the next Escape
 * closes it.
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
        // Blueprint's `shouldShowErrorStyling`: not while a correction is
        // being typed.
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
    // The next focus of the input comes from closing the calendar, and
    // does not open it again.
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
    mut_elements.content === undefined
      ? ([] as const)
      : Array.from(
          mut_elements.content.querySelectorAll<HTMLElement>(FOCUSABLE),
        )
          .filter(
            (element) =>
              element.tabIndex >= 0 && !element.hasAttribute('disabled'),
          )
          .slice(1, -1);

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

  const Overlay = (): JSX.Element => {
    const [position$, setPosition] = createState<Optional<PopoverPosition>>(
      Optional.none,
    );

    const [phase$, setPhase] = createState<'enter' | 'active' | 'done'>(
      'enter',
    );

    const afterUpdate = createAfterUpdate();

    const placement$ = position$.pipe(
      map((position) =>
        Optional.isSome(position) ? position.value.placement : 'bottom',
      ),
    );

    const mut_container: { element: HTMLDivElement | undefined } = {
      element: undefined,
    };

    const place = (): void => {
      const { target } = mut_elements;

      const container = mut_container.element;

      if (target === undefined || container === undefined) {
        return;
      }

      setPosition(
        Optional.some(
          placeBottomStart(
            target.getBoundingClientRect(),
            { width: container.offsetWidth, height: container.offsetHeight },
            {
              width: document.documentElement.clientWidth,
              height: window.innerHeight,
            },
          ),
        ),
      );
    };

    listenInScope(globalThis, 'resize', place);

    listenInScope(document, 'scroll', place, { capture: true, passive: true });

    listenInScope(
      document,
      'mousedown',
      (event) => {
        const pressed = event.target;

        if (
          pressed instanceof Node &&
          mut_elements.target?.contains(pressed) !== true &&
          mut_container.element?.contains(pressed) !== true
        ) {
          setOpen(false);
        }
      },
      { capture: true },
    );

    // Blueprint's enter transition: `-enter`, then `-enter-active` from the
    // next frame for the 300ms it runs, then `-enter-done`.
    const mut_transition: {
      frame: number;
      timer: ReturnType<typeof setTimeout> | undefined;
    } = { frame: 0, timer: undefined };

    onScopeDispose(() => {
      cancelAnimationFrame(mut_transition.frame);

      clearTimeout(mut_transition.timer);
    });

    afterUpdate(() => {
      place();

      mut_transition.frame = requestAnimationFrame(() => {
        setPhase('active');
      });

      mut_transition.timer = setTimeout(() => {
        setPhase('done');
      }, TRANSITION_MS);
    });

    return (
      <div
        aria-live={constant('polite')}
        class={constant('bp6-overlay bp6-overlay-open bp6-overlay-inline')}
      >
        <div
          ref={(container) => {
            mut_container.element = container;

            const observer = new ResizeObserver(() => {
              place();
            });

            observer.observe(container);

            onScopeDispose(() => {
              observer.disconnect();
            });
          }}
          class={{
            'bp6-popover-transition-container': constant(true),
            'bp6-overlay-content': constant(true),
            'bp6-popover-enter': view(phase$, (phase) => phase !== 'done'),
            'bp6-popover-enter-active': view(
              phase$,
              (phase) => phase === 'active',
            ),
            'bp6-popover-enter-done': view(phase$, (phase) => phase === 'done'),
          }}
          style={{
            position: constant('fixed'),
            left: view(position$, (position) =>
              Optional.isSome(position) ? `${position.value.left}px` : '0px',
            ),
            top: view(position$, (position) =>
              Optional.isSome(position) ? `${position.value.top}px` : '0px',
            ),
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') {
              return;
            }

            event.preventDefault();

            event.stopPropagation();

            focusInput(true);
          }}
        >
          <div
            class={view(
              placement$,
              (placement) =>
                `bp6-popover bp6-popover-placement-${placement} bp6-date-input-popover`,
            )}
            style={{
              'transform-origin': view(position$, (position) =>
                Optional.isSome(position)
                  ? `${position.value.arrowLeft + ARROW_SIZE / 2}px ${position.value.placement === 'top' ? 'bottom' : 'top'}`
                  : undefined,
              ),
            }}
          >
            <div
              aria-hidden={constant('true')}
              class={constant('bp6-popover-arrow')}
              data-popper-arrow={constant('')}
              style={{
                left: view(position$, (position) =>
                  Optional.isSome(position)
                    ? `${position.value.arrowLeft}px`
                    : undefined,
                ),
                top: view(placement$, (placement) =>
                  placement === 'bottom' ? ARROW_STAND_OFF : undefined,
                ),
                bottom: view(placement$, (placement) =>
                  placement === 'top' ? ARROW_STAND_OFF : undefined,
                ),
              }}
            >
              <svg
                style={view(
                  placement$,
                  (placement) =>
                    `transform: rotate(${placement === 'top' ? -90 : 90}deg);`,
                )}
                viewBox={constant(`0 0 ${ARROW_SIZE} ${ARROW_SIZE}`)}
              >
                <path
                  class={constant('bp6-popover-arrow-border')}
                  d={constant(ARROW_BORDER_PATH)}
                />
                <path
                  class={constant('bp6-popover-arrow-fill')}
                  d={constant(ARROW_FILL_PATH)}
                />
              </svg>
            </div>
            <div class={constant('bp6-popover-content')}>
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
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          aria-expanded={view(open$, String)}
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

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

const TRANSITION_MS = 300;

/** Half the arrow less the 4px it overlaps the popover, as Blueprint has it. */
const ARROW_STAND_OFF = `${-(ARROW_SIZE / 2 - 4)}px` as const;

/** Blueprint's `PopoverArrow` paths (`@blueprintjs/core` 6.21). */
const ARROW_BORDER_PATH =
  'M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z';

const ARROW_FILL_PATH =
  'M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z';

const isInside = (
  target: EventTarget | null,
  container: Element | undefined,
): boolean => target instanceof Node && container?.contains(target) === true;
