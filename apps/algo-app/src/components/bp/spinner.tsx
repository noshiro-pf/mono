import { constant, type JSX } from 'synstate-dom';
import { Num, asPositiveFiniteNumber } from 'ts-data-forge';
import { spinnerSize } from './spinner-size.mjs';
import * as styles from './spinner.module.css';

type Props = Readonly<{
  size: number;
}>;

// see http://stackoverflow.com/a/18473154/3124288 for calculating arc path
const R = 45;

const SPINNER_TRACK = `M 50,50 m 0,-${R} a ${R},${R} 0 1 1 0,${
  R * 2
} a ${R},${R} 0 1 1 0,-${R * 2}` as const;

// unitless total length of SVG path, to which stroke-dash* properties are relative.
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pathLength
// this value is the result of `<path d={SPINNER_TRACK} />.getTotalLength()` and works in all browsers:
const PATH_LENGTH = 280;

const MIN_SIZE = 10;

const STROKE_WIDTH = 4;

const MIN_STROKE_WIDTH = 16;

const getViewBox = (strokeWidth: number): string => {
  const radius = R + strokeWidth / 2;

  const viewBoxX = (50 - radius).toFixed(2);

  const viewBoxWidth = (radius * 2).toFixed(2);

  return `${viewBoxX} ${viewBoxX} ${viewBoxWidth} ${viewBoxWidth}`;
};

/**
 * An indeterminate Blueprint spinner; the look and the rotation are
 * `spinner.module.css`.
 */
export const Spinner = ({ size: _size }: Props): JSX.Element => {
  const size = asPositiveFiniteNumber(Math.max(MIN_SIZE, _size));

  const strokeWidth = Math.min(
    MIN_STROKE_WIDTH,
    Num.div(STROKE_WIDTH * spinnerSize.LARGE, size),
  );

  // A quarter of the track, as Blueprint draws a spinner with no value.
  const strokeOffset = PATH_LENGTH - PATH_LENGTH * 0.25;

  // multiple DOM elements around SVG are necessary to properly isolate animation:
  // - SVG elements in IE do not support anim/trans so they must be set on a parent HTML element.
  // - SPINNER_ANIMATION isolates svg from parent display and is always centered inside root element.
  return (
    <div class={constant(styles.spinner)} role={constant('progressbar')}>
      <div
        class={constant(styles.animation)}
        style={{
          width: constant(`${size}px`),
          height: constant(`${size}px`),
        }}
      >
        <svg
          height={constant(size)}
          stroke-width={constant(strokeWidth.toFixed(2))}
          viewBox={constant(getViewBox(strokeWidth))}
          width={constant(size)}
        >
          <path class={constant(styles.track)} d={constant(SPINNER_TRACK)} />
          <path
            class={constant(styles.head)}
            d={constant(SPINNER_TRACK)}
            pathLength={constant(PATH_LENGTH)}
            stroke-dasharray={constant(`${PATH_LENGTH} ${PATH_LENGTH}`)}
            stroke-dashoffset={constant(strokeOffset)}
          />
        </svg>
      </div>
    </div>
  );
};
