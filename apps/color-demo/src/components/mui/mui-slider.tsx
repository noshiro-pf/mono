import { createState, type InitializedObservable, map } from 'synstate';
import { constant, inlineMap, type JSX } from 'synstate-dom';
import { Arr, asUint32, Num } from 'ts-data-forge';
import * as styles from './mui-slider.module.css';

type Props = Readonly<{
  /** The id of the element that names the slider. */
  ariaLabelledby: string;
  min: number;
  max: number;
  step: number;
  value: InitializedObservable<number>;
  /** Called with each new value, never with the one the slider holds. */
  onChange: (value: number) => void;
}>;

/**
 * MUI's `Slider` with `marks` and `valueLabelDisplay="auto"`, in the default
 * theme's look and markup, without the ripple. As in MUI, the keyboard and
 * assistive technology work on a visually hidden `<input type="range">` in the
 * thumb, and a press or a drag on the rail moves the value to the nearest step.
 */
export const MuiSlider = ({
  ariaLabelledby,
  min,
  max,
  step,
  value,
  onChange,
}: Props): JSX.Element => {
  const [dragging$, setDragging] = createState(false);

  // How many whole steps fit in the range, as MUI counts its marks: none for a
  // step of 0 or an empty range. A range that is not a whole number of steps
  // ends short of `max`, as the native input's grid does. The tolerance keeps a
  // quotient such as 0.3 / 0.1 = 2.9999999999999996 from losing the last step.
  const stepCount = Num.isNonZero(step)
    ? Math.max(0, Math.floor(Num.div(max - min, step) + 1e-9))
    : 0;

  // The value of the `index`th stop: rounded to the step's decimal places, so
  // that 3 * 0.1 is 0.3 as the native input has it, and kept in the range.
  const gridValue = (index: number): number => {
    const exact = min + index * step;

    const scale = 10 ** decimalPlaces(step);

    return Num.clamp(
      Num.isNonZero(scale) ? Num.div(Math.round(exact * scale), scale) : exact,
      min,
      max,
    );
  };

  const percent = value.pipe(map((v) => `${toPercent(v, min, max)}%`));

  const label = value.pipe(map((v) => v.toString()));

  const change = (next: number): void => {
    if (next !== value.getSnapshot().value) {
      onChange(next);
    }
  };

  const changeFromPointer = (root: HTMLElement, clientX: number): void => {
    const rect = root.getBoundingClientRect();

    const ratio = Num.isNonZero(rect.width)
      ? Num.clamp(Num.div(clientX - rect.left, rect.width), 0, 1)
      : 0;

    change(gridValue(Math.round(stepCount * ratio)));
  };

  return (
    <span
      class={{
        [styles.root]: constant(true),
        [styles.dragging]: dragging$,
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }

        // Keeps the input's focus from the press, as MUI does: the thumb takes
        // the focus below, without the keyboard focus ring.
        event.preventDefault();

        const root = event.currentTarget;

        root.setPointerCapture(event.pointerId);

        setDragging(true);

        changeFromPointer(root, event.clientX);

        root.querySelector<HTMLInputElement>(':scope input')?.focus();
      }}
      onPointerMove={(event) => {
        if (dragging$.getSnapshot().value) {
          changeFromPointer(event.currentTarget, event.clientX);
        }
      }}
      onPointerUp={() => {
        setDragging(false);
      }}
      onPointerCancel={() => {
        setDragging(false);
      }}
    >
      <span class={constant(styles.rail)} />
      <span
        class={constant(styles.track)}
        style={{ left: constant('0%'), width: percent }}
      />
      {Arr.seq(asUint32(stepCount + 1)).map((index) => {
        const markValue = gridValue(index);

        return (
          <span
            class={{
              [styles.mark]: constant(true),
              [styles.markActive]: inlineMap(value, (v) => v >= markValue),
            }}
            data-index={constant(index.toString())}
            style={{ left: constant(`${toPercent(markValue, min, max)}%`) }}
          />
        );
      })}
      <span
        class={{
          [styles.thumb]: constant(true),
          [styles.active]: dragging$,
        }}
        style={{ left: percent }}
      >
        <input
          aria-labelledby={constant(ariaLabelledby)}
          aria-orientation={constant('horizontal')}
          class={constant(styles.input)}
          max={constant(max.toString())}
          min={constant(min.toString())}
          step={constant(step.toString())}
          type={constant('range')}
          value={label}
          onInput={(event) => {
            change(event.currentTarget.valueAsNumber);
          }}
        />
        <span
          aria-hidden={constant('true')}
          class={constant(styles.valueLabel)}
        >
          <span>
            <span>{label}</span>
          </span>
        </span>
      </span>
    </span>
  );
};

/** The digits after the decimal point of a step such as 0.25 (2). */
const decimalPlaces = (step: number): number =>
  step.toString().split('.', 2)[1]?.length ?? 0;

const toPercent = (value: number, min: number, max: number): number => {
  const range = max - min;

  return Num.isNonZero(range) ? Num.div((value - min) * 100, range) : 0;
};
