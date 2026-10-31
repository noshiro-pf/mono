import { constant, type Bindable, type JSX } from 'synstate-dom';
import { asPositiveFiniteNumber, Num } from 'ts-data-forge';
import { classObject, intentClass } from '../internal/index.mjs';
import type { Intent } from './intent.mjs';

/** Blueprint's `SpinnerSize`, in pixels. */
export const SpinnerSize = {
  SMALL: 20,
  STANDARD: 50,
  LARGE: 100,
} as const;

type Props = Readonly<{
  /** The diameter in pixels; at least 10, and `STANDARD` if not finite. */
  size?: number;
  intent?: Intent;
  /** Classes after Blueprint's own. */
  class?: string;
  /** What assistive technology reads out; `loading` by default, as Blueprint's. */
  'aria-label'?: Bindable<string>;
}>;

/**
 * Blueprint's `Spinner` with no value: a quarter of the track, turning, in the
 * markup Blueprint's style sheets animate.
 */
export const Spinner = ({
  size: sizeProp = SpinnerSize.STANDARD,
  intent = 'none',
  class: className,
  'aria-label': ariaLabel = constant('loading'),
}: Props): JSX.Element => {
  const size = asPositiveFiniteNumber(
    Number.isFinite(sizeProp)
      ? Math.max(minSize, sizeProp)
      : SpinnerSize.STANDARD,
  );

  const strokeWidth = Math.min(
    minStrokeWidth,
    Num.div(strokeWidthAtLarge * SpinnerSize.LARGE, size),
  );

  return (
    <div
      aria-label={ariaLabel}
      aria-valuemax={constant(100)}
      aria-valuemin={constant(0)}
      class={classObject(['bp6-spinner', intentClass(intent), className])}
      role={constant('progressbar')}
    >
      <div
        class={constant('bp6-spinner-animation')}
        style={{
          width: constant(`${size}px`),
          height: constant(`${size}px`),
        }}
      >
        <svg
          height={constant(size)}
          stroke-width={constant(strokeWidth.toFixed(2))}
          viewBox={constant(viewBoxOf(strokeWidth))}
          width={constant(size)}
        >
          <path class={constant('bp6-spinner-track')} d={constant(track)} />
          <path
            class={constant('bp6-spinner-head')}
            d={constant(track)}
            pathLength={constant(pathLength)}
            stroke-dasharray={constant(`${pathLength} ${pathLength}`)}
            stroke-dashoffset={constant(pathLength * 0.75)}
          />
        </svg>
      </div>
    </div>
  );
};

const r = 45;

/** A circle of radius `r` round (50, 50), as Blueprint draws it. */
const track =
  `M 50,50 m 0,-${r} a ${r},${r} 0 1 1 0,${r * 2} a ${r},${r} 0 1 1 0,-${r * 2}` as const;

/** The length `stroke-dash*` are measured against. */
const pathLength = 280;

const minSize = 10;

const strokeWidthAtLarge = 4;

const minStrokeWidth = 16;

const viewBoxOf = (strokeWidth: number): string => {
  const radius = r + strokeWidth / 2;

  const x = (50 - radius).toFixed(2);

  const width = (radius * 2).toFixed(2);

  return `${x} ${x} ${width} ${width}`;
};
