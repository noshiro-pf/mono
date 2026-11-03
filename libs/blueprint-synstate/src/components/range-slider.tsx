import { createState, onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  derive,
  mapBindable,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Num } from 'ts-data-forge';
import type { MutableFixedLengthTuple, UintRange } from 'ts-type-forge';
import { classObject, intentClass, parseInteger } from '../internal/index.mjs';
import type { Intent } from './intent.mjs';

/** A range's two ends, the start first: Blueprint's `NumberRange`. */
export type NumberRange = readonly [start: number, end: number];

type Props = Readonly<{
  /** Where the two handles are; the slider is controlled. */
  value: Bindable<NumberRange>;
  /** 0 by default. */
  min?: number;
  /** 10 by default. */
  max?: number;
  /** What a handle moves by, by the pointer or an arrow key; 1 by default. */
  stepSize?: number;
  /** A label every this much from `min`, 1 by default; not with `labelValues`. */
  labelStepSize?: number;
  /** The values labelled, in place of every `labelStepSize`. */
  labelValues?: readonly number[];
  /** Decimal places of a label; by default those of `stepSize`. */
  labelPrecision?: UintRange<0, 21>;
  /**
   * What a label reads, and that on a handle (`isHandleTooltip`); `false` draws
   * none and a shorter slider (`bp6-slider-unlabeled`).
   */
  labelRenderer?:
    | boolean
    | ((
        value: number,
        options: Readonly<{ isHandleTooltip: boolean }>,
      ) => string);
  /** That of the track between the handles; `primary` by default. */
  intent?: Intent;
  /** The track between the handles takes `intent`; on by default. */
  showTrackFill?: boolean;
  disabled?: Bindable<boolean>;
  /** Asked to move the range to this, as a handle is dragged or keyed. */
  onChange?: (value: NumberRange) => void;
  /** Where the range was left, as a handle is let go or its key comes up. */
  onRelease?: (value: NumberRange) => void;
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: string;
}>;

/**
 * Blueprint's `RangeSlider`, horizontal: `div.bp6-slider` with its track, its
 * labels and two handles, `span.bp6-slider-handle[role=slider]`. A handle is
 * dragged, or moved by the arrow keys, and stops at the other; a press on the
 * track drags the handle nearest it.
 */
export const RangeSlider = ({
  value,
  min = 0,
  max = 10,
  stepSize = 1,
  labelStepSize,
  labelValues,
  labelPrecision = decimalPlacesOf(stepSize),
  labelRenderer = true,
  intent = 'primary',
  showTrackFill = true,
  disabled = constant(false),
  onChange,
  onRelease,
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  // As Blueprint's `validateProps`, in its order, which throws rather than loop
  // forever.
  if (stepSize <= 0) {
    throw new Error(
      '[blueprint-synstate] RangeSlider: stepSize must be above 0',
    );
  }

  if (labelStepSize !== undefined && labelValues !== undefined) {
    throw new Error(
      '[blueprint-synstate] RangeSlider: labelStepSize and labelValues cannot both be given',
    );
  }

  if (labelStepSize !== undefined && labelStepSize <= 0) {
    throw new Error(
      '[blueprint-synstate] RangeSlider: labelStepSize must be above 0',
    );
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new TypeError(
      '[blueprint-synstate] RangeSlider: min and max must be finite',
    );
  }

  const value$ = toObservable(value);

  const disabled$ = toObservable(disabled);

  const [moving$, setMoving] = createState<HandleIndex | undefined>(undefined);

  // How many times the handles have been laid out: Blueprint React places a
  // handle once it has mounted and can be measured, and measures it again on
  // every render; here, again as a handle's size changes, as when a hidden
  // slider is shown.
  const [layouts$, setLayouts] = createState(0);

  const relayout = (): void => {
    setLayouts(layouts$.getSnapshot().value + 1);
  };

  createAfterUpdate()(relayout);

  const handleSizes = new ResizeObserver(relayout);

  const mut_elements: {
    track: HTMLElement | undefined;
    handles: MutableFixedLengthTuple<2, HTMLElement | undefined>;
  } = { track: undefined, handles: [undefined, undefined] };

  const mut_drag: { stop: () => void } = { stop: () => {} };

  onScopeDispose(() => {
    mut_drag.stop();

    handleSizes.disconnect();
  });

  const span = max - min;

  const ratio = Num.isNonZero(span) ? Num.div(1, span) : 0;

  const format = (n: number, isHandleTooltip: boolean): string | undefined =>
    labelRenderer === false
      ? undefined
      : labelRenderer === true
        ? n.toFixed(labelPrecision)
        : labelRenderer(n, { isHandleTooltip });

  const valueAt = (index: HandleIndex): number =>
    value$.getSnapshot().value[index];

  /**
   * The range once the handle at `index` is at `next`, which stops at the other
   * handle: Blueprint's `getNewHandleValues` for two handles that lock.
   */
  const rangeWith = (index: HandleIndex, next: number): NumberRange => {
    const [start, end] = value$.getSnapshot().value;

    return index === 0
      ? [Math.min(next, end), end]
      : [start, Math.max(next, start)];
  };

  /** Clamps `next` and asks for it, if it moves the handle at `index`. */
  const changeValue = (index: HandleIndex, next: number): number => {
    const clamped = clamp(next, min, max);

    if (!Number.isNaN(clamped) && clamped !== valueAt(index)) {
      const range = rangeWith(index, clamped);

      const [start, end] = value$.getSnapshot().value;

      if (range[0] !== start || range[1] !== end) {
        onChange?.(range);
      }
    }

    return clamped;
  };

  /** The value the pointer at `clientX` stands for, measured from a handle. */
  const clientToValue = (index: HandleIndex, clientX: number): number => {
    const element = mut_elements.handles[index];

    const current = valueAt(index);

    if (element === undefined) {
      return current;
    }

    const { left } = element.getBoundingClientRect();

    const pixelDelta = clientX - (left + element.offsetWidth / 2);

    // Measured as the pointer moves, rather than once mounted as Blueprint
    // does, so that a resized track is followed.
    const tickSize = (mut_elements.track?.clientWidth ?? 0) * ratio;

    const pixelsPerStep = tickSize * stepSize;

    return Number.isNaN(pixelDelta) || !Num.isNonZero(pixelsPerStep)
      ? current
      : current + Math.round(Num.div(pixelDelta, pixelsPerStep)) * stepSize;
  };

  const beginMovement = (
    index: HandleIndex,
    clientX: number,
    kind: 'mouse' | 'touch',
  ): void => {
    mut_drag.stop();

    const moveType = kind === 'mouse' ? 'mousemove' : 'touchmove';

    const endTypes =
      kind === 'mouse'
        ? (['mouseup'] as const)
        : (['touchend', 'touchcancel'] as const);

    const onMove = (event: MouseEvent | TouchEvent): void => {
      if (!disabled$.getSnapshot().value) {
        changeValue(index, clientToValue(index, clientXOf(event)));
      }
    };

    const onEnd = (event: MouseEvent | TouchEvent): void => {
      mut_drag.stop();

      const final = changeValue(index, clientToValue(index, clientXOf(event)));

      onRelease?.(rangeWith(index, final));
    };

    document.addEventListener(moveType, onMove);

    for (const type of endTypes) {
      document.addEventListener(type, onEnd);
    }

    mut_drag.stop = () => {
      document.removeEventListener(moveType, onMove);

      for (const type of endTypes) {
        document.removeEventListener(type, onEnd);
      }

      mut_drag.stop = () => {};

      setMoving(undefined);
    };

    setMoving(index);

    changeValue(index, clientToValue(index, clientX));
  };

  /** Blueprint's `nearestHandleForValue`: the start on a tie. */
  const nearestHandle = (clientX: number): HandleIndex => {
    const distanceOf = (index: HandleIndex): number =>
      Math.abs(clientToValue(index, clientX) - valueAt(index));

    return distanceOf(1) < distanceOf(0) ? 1 : 0;
  };

  const onTrackPress = (
    event: Readonly<{ target: EventTarget | null }>,
    clientX: number,
    kind: 'mouse' | 'touch',
  ): void => {
    if (
      disabled$.getSnapshot().value ||
      (event.target instanceof Element &&
        event.target.closest('.bp6-slider-handle') !== null)
    ) {
      return;
    }

    beginMovement(nearestHandle(clientX), clientX, kind);
  };

  /** Offset of `n` from `min` along the track, as Blueprint's fills read it. */
  const offsetRatio = (n: number): number => clamp((n - min) * ratio, 0, 1);

  // The ends low to high, so that a reversed value draws no fill of negative
  // width: the intent between them, where Blueprint's, sorting its handles,
  // puts it after the start handle.
  const low$ = mapBindable(value$, ([start, end]) => Math.min(start, end));

  const high$ = mapBindable(value$, ([start, end]) => Math.max(start, end));

  const fill = (
    from$: Bindable<number>,
    to$: Bindable<number>,
    fillIntent: Intent,
  ): JSX.Element => (
    <div
      class={classObject([
        'bp6-slider-progress',
        showTrackFill ? intentClass(fillIntent) : undefined,
      ])}
      style={{
        left: mapBindable(from$, (from) => percentage(offsetRatio(from))),
        right: mapBindable(to$, (to) => percentage(1 - offsetRatio(to))),
        top: constant('0px'),
      }}
    />
  );

  const handle = (index: HandleIndex): JSX.Element => {
    const at$ = mapBindable(value$, (range) => range[index]);

    const label$ = mapBindable(at$, (at) => format(at, true));

    return (
      <span
        ref={(element) => {
          mut_elements.handles[index] = element;

          handleSizes.observe(element);
        }}
        aria-disabled={mapBindable(disabled$, (isDisabled) =>
          isDisabled ? 'true' : 'false',
        )}
        aria-orientation={constant('horizontal')}
        aria-valuemax={constant(max.toString())}
        aria-valuemin={constant(min.toString())}
        aria-valuenow={mapBindable(at$, (at) => at.toString())}
        class={classObject(
          ['bp6-slider-handle', index === 0 ? 'bp6-start' : 'bp6-end'],
          [['bp6-active', mapBindable(moving$, (moving) => moving === index)]],
        )}
        role={constant('slider')}
        style={{
          left: derive([at$, layouts$], (at, layouts) => {
            const element = mut_elements.handles[index];

            return layouts === 0 || element === undefined
              ? undefined
              : `calc(${percentage((at - min) * ratio)} - ${(element.offsetHeight / 2).toString()}px)`;
          }),
        }}
        tabIndex={constant(0)}
        onKeyDown={(event) => {
          const direction = arrowDirectionOf(event.key);

          if (direction === undefined || disabled$.getSnapshot().value) {
            return;
          }

          changeValue(index, valueAt(index) + stepSize * direction);

          event.preventDefault();
        }}
        onKeyUp={(event) => {
          if (
            !disabled$.getSnapshot().value &&
            arrowDirectionOf(event.key) !== undefined
          ) {
            onRelease?.(rangeWith(index, valueAt(index)));
          }
        }}
        onMouseDown={(event) => {
          if (!disabled$.getSnapshot().value) {
            beginMovement(index, event.clientX, 'mouse');
          }
        }}
        onTouchStart={(event) => {
          if (!disabled$.getSnapshot().value) {
            beginMovement(index, clientXOf(event), 'touch');
          }
        }}
      >
        {labelRenderer === false ? (
          []
        ) : (
          <span class={constant('bp6-slider-label')}>
            {mapBindable(label$, (label) => label ?? '')}
          </span>
        )}
      </span>
    );
  };

  const labelled =
    labelRenderer === false
      ? ([] as const)
      : (labelValues ?? stepsFrom(min, max, labelStepSize ?? 1));

  return (
    <div
      class={classObject(
        [
          'bp6-slider',
          labelRenderer === false && 'bp6-slider-unlabeled',
          className,
        ],
        [['bp6-disabled', disabled$]],
      )}
      data-e2e={e2e === undefined ? undefined : constant(e2e)}
      onMouseDown={(event) => {
        onTrackPress(event, event.clientX, 'mouse');
      }}
      onTouchStart={(event) => {
        onTrackPress(event, clientXOf(event), 'touch');
      }}
    >
      <div
        ref={(track) => {
          mut_elements.track = track;
        }}
        class={constant('bp6-slider-track')}
      >
        {fill(constant(min), low$, 'none')}
        {fill(low$, high$, intent)}
        {fill(high$, constant(max), 'none')}
      </div>
      <div class={constant('bp6-slider-axis')}>
        {labelRenderer === false
          ? []
          : labelled.map((step) => (
              <div
                class={constant('bp6-slider-label')}
                style={{
                  left: constant(percentage((step - min) * ratio)),
                }}
              >
                {constant(format(step, false) ?? '')}
              </div>
            ))}
      </div>
      {handle(0)}
      {handle(1)}
    </div>
  );
};

/** The start handle, 0, or the end, 1. */
type HandleIndex = 0 | 1;

/** `NaN` stays `NaN`, which `Num.clamp` takes to `low`. */
const clamp = (n: number, low: number, high: number): number =>
  Math.min(Math.max(n, low), high);

/** Blueprint's `formatPercentage`. */
const percentage = (ratio: number): string =>
  `${(ratio * 100).toFixed(2)}%` as const;

/**
 * Blueprint's `countDecimalPlaces`: the places after the point of `n` as
 * JavaScript writes it, its exponent included, as many as `toFixed` takes
 * everywhere.
 */
const decimalPlacesOf = (n: number): UintRange<0, 21> => {
  const [digits = '', exponent = '0'] = n.toString().split('e', 2);

  const places =
    (digits.split('.', 2)[1]?.length ?? 0) - parseInteger(exponent);

  return isFractionDigits(places) ? places : places < 0 ? 0 : 20;
};

const isFractionDigits = Num.isUintInRange(0, 21);

/**
 * `min`, then every `step` up to `max`, which is included within 0.00001, as
 * Blueprint adds them up; at most {@link maxLabels}, so that a step too small
 * for its bounds throws rather than loop on.
 */
const stepsFrom = (
  min: number,
  max: number,
  step: number,
): readonly number[] => {
  const mut_steps: number[] = [];

  for (
    let mut_at = min;
    mut_at < max || Math.abs(mut_at - max) <= 0.00001;
    mut_at += step
  ) {
    if (Arr.isFixedLengthArray(maxLabels, mut_steps)) {
      throw new Error(
        `[blueprint-synstate] RangeSlider: more than ${maxLabels.toString()} labels; give a larger labelStepSize, or labelValues`,
      );
    }

    mut_steps.push(mut_at);
  }

  return mut_steps;
};

const maxLabels = 1000;

/** Left and down lower a handle, right and up raise it, as in Blueprint. */
const arrowDirectionOf = (key: string): -1 | 1 | undefined =>
  key === 'ArrowLeft' || key === 'ArrowDown'
    ? -1
    : key === 'ArrowRight' || key === 'ArrowUp'
      ? 1
      : undefined;

const clientXOf = (event: MouseEvent | TouchEvent): number =>
  event instanceof MouseEvent
    ? event.clientX
    : (event.changedTouches[0]?.clientX ?? 0);
