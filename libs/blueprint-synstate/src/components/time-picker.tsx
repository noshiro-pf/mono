import { createState, derive, map } from 'synstate';
import {
  constant,
  toObservable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  formatTime,
  isTimeUnitText,
  pad2,
  parseTime,
  TIME_UNIT_MAX,
  type TimeOfDay,
} from '../date/index.mjs';
import { isImeKeyDown, parseInteger, uniqueId } from '../internal/index.mjs';
import { Icon } from './icon.js';

/** What a {@link TimePicker} reads out; Blueprint's wording by default. */
export type TimePickerLabels = Readonly<{
  hours: string;
  minutes: string;
  increaseHours: string;
  decreaseHours: string;
  increaseMinutes: string;
  decreaseMinutes: string;
}>;

export const DEFAULT_TIME_PICKER_LABELS: TimePickerLabels = {
  hours: 'hours (24hr clock)',
  minutes: 'minutes',
  increaseHours: 'Increase hours (24hr clock)',
  decreaseHours: 'Decrease hours (24hr clock)',
  increaseMinutes: 'Increase minutes',
  decreaseMinutes: 'Decrease minutes',
} as const;

type Props = Readonly<{
  /** `HH:mm`, the value of `<input type="time">`; `''` shows 0:00. */
  value: Bindable<string>;
  onChange: (value: string) => void;
  /** The chevrons above and below the fields, easier to hit on a phone. */
  showArrowButtons?: boolean;
  disabled?: boolean;
  labels?: Partial<TimePickerLabels>;
}>;

/**
 * Blueprint's `TimePicker` to the minute on a 24-hour clock, in its markup:
 * an hours and a minutes field, `:` between them, and with `showArrowButtons` a
 * row of chevrons above and below.
 *
 * As Blueprint's does, a field is typed in freely and read when it loses the
 * focus or Enter is pressed: a number in range becomes the value, and anything
 * else is put back. A field holding something out of range is drawn as an error
 * meanwhile. ArrowUp and ArrowDown and the chevrons step the unit by one, round
 * from 23 to 0 and from 59 to 0 without carrying into the hour.
 */
export const TimePicker = ({
  value,
  onChange,
  showArrowButtons = false,
  disabled = false,
  labels: labelOverrides,
}: Props): JSX.Element => {
  const labels = { ...DEFAULT_TIME_PICKER_LABELS, ...labelOverrides } as const;

  const ids = {
    hour: uniqueId('hour24-input'),
    minute: uniqueId('minute-input'),
  } as const;

  const time$ = toObservable(value).pipe(map(parseTime));

  // What is being typed into a field, until it is read.
  const [editing$, setEditing] = createState<Optional<Editing>>(Optional.none);

  const currentTime = (): TimeOfDay => time$.getSnapshot().value;

  const commit = (unit: Unit, next: number): void => {
    const time = currentTime();

    onChange(
      formatTime(
        unit === 'hour' ? { ...time, hour: next } : { ...time, minute: next },
      ),
    );
  };

  const shift = (unit: Unit, amount: number): void => {
    if (disabled) {
      return;
    }

    const time = currentTime();

    const max = TIME_UNIT_MAX[unit];

    const current = unit === 'hour' ? time.hour : time.minute;

    commit(unit, (current + amount + max + 1) % (max + 1));
  };

  const renderArrow = (unit: Unit, up: boolean): JSX.Element => (
    <span
      aria-controls={constant(ids[unit])}
      aria-label={constant(
        unit === 'hour'
          ? up
            ? labels.increaseHours
            : labels.decreaseHours
          : up
            ? labels.increaseMinutes
            : labels.decreaseMinutes,
      )}
      class={constant(
        `bp6-timepicker-arrow-button bp6-timepicker-${unit === 'hour' ? 'hour' : 'minute'}`,
      )}
      // -1 so that a press keeps a `relatedTarget` for the blur it causes.
      tabIndex={constant(-1)}
      onClick={() => {
        shift(unit, up ? 1 : -1);
      }}
    >
      <Icon icon={up ? 'chevron-up' : 'chevron-down'} />
    </span>
  );

  const renderInput = (unit: Unit): JSX.Element => {
    const text$ = derive([time$, editing$], (time, editing) =>
      Optional.isSome(editing) && editing.value.unit === unit
        ? editing.value.text
        : unit === 'hour'
          ? time.hour.toString()
          : pad2(time.minute),
    );

    return (
      <input
        aria-label={constant(unit === 'hour' ? labels.hours : labels.minutes)}
        class={{
          'bp6-timepicker-input': constant(true),
          [`bp6-timepicker-${unit}`]: constant(true),
          'bp6-intent-danger': view(
            text$,
            (text) => !isTimeUnitText(unit, text),
          ),
        }}
        disabled={constant(disabled)}
        id={constant(ids[unit])}
        max={constant(TIME_UNIT_MAX[unit].toString())}
        min={constant('0')}
        type={constant('number')}
        value={text$}
        {...(showArrowButtons ? { role: constant('spinbutton') } : {})}
        onBlur={(event) => {
          const text = event.currentTarget.value;

          setEditing(Optional.none);

          if (!isTimeUnitText(unit, text)) {
            return;
          }

          const next = parseInteger(text);

          const time = currentTime();

          if (next !== (unit === 'hour' ? time.hour : time.minute)) {
            commit(unit, next);
          }
        }}
        onInput={(event) => {
          setEditing(
            Optional.some({ unit, text: event.currentTarget.value } as const),
          );
        }}
        onKeyDown={(event) => {
          // Keys that pick, confirm or cancel what an input method is composing.
          if (isImeKeyDown(event)) {
            return;
          }

          switch (event.key) {
            case 'ArrowUp':
              event.preventDefault();

              setEditing(Optional.none);

              shift(unit, 1);

              break;

            case 'ArrowDown':
              event.preventDefault();

              setEditing(Optional.none);

              shift(unit, -1);

              break;

            case 'Enter':
              event.preventDefault();

              event.currentTarget.blur();

              break;

            default:
              break;
          }
        }}
      />
    );
  };

  return (
    <div
      class={constant(
        disabled ? 'bp6-timepicker bp6-disabled' : 'bp6-timepicker',
      )}
    >
      {/* The rows are there without the arrows too, as in Blueprint's. */}
      <div class={constant('bp6-timepicker-arrow-row')}>
        {showArrowButtons
          ? [renderArrow('hour', true), renderArrow('minute', true)]
          : []}
      </div>
      <div class={constant('bp6-timepicker-input-row')}>
        {renderInput('hour')}
        <span class={constant('bp6-timepicker-divider-text')}>
          {constant(':')}
        </span>
        {renderInput('minute')}
      </div>
      <div class={constant('bp6-timepicker-arrow-row')}>
        {showArrowButtons
          ? [renderArrow('hour', false), renderArrow('minute', false)]
          : []}
      </div>
    </div>
  );
};

type Unit = keyof typeof TIME_UNIT_MAX;

type Editing = Readonly<{ unit: Unit; text: string }>;
