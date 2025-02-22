import { keyframes } from '@noshiro/goober';
import { spinnerSize } from './spinner-size';

type Props = Readonly<{
  size: number;
  value?: number;
}>;

// see http://stackoverflow.com/a/18473154/3124288 for calculating arc path
const R = 45;
const SPINNER_TRACK = `M 50,50 m 0,-${R} a ${R},${R} 0 1 1 0,${
  R * 2
} a ${R},${R} 0 1 1 0,-${R * 2}`;

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

export const Spinner = memoNamed<Props>('Spinner', ({ size: _size, value }) => {
  const size = toPositiveFiniteNumber(Math.max(MIN_SIZE, _size));

  const strokeWidth = useMemo(
    () =>
      Math.min(
        MIN_STROKE_WIDTH,
        Num.div(STROKE_WIDTH * spinnerSize.LARGE, size),
      ),
    [size],
  );

  const strokeOffset =
    PATH_LENGTH -
    PATH_LENGTH * (mapOptional(value, Num.clamp<number>(0, 1)) ?? 0.25);

  const viewBox = useMemo(() => getViewBox(strokeWidth), [strokeWidth]);

  const animationStyle = useMemo(
    () => ({
      width: `${size}px`,
      height: `${size}px`,
    }),
    [size],
  );

  // multiple DOM elements around SVG are necessary to properly isolate animation:
  // - SVG elements in IE do not support anim/trans so they must be set on a parent HTML element.
  // - SPINNER_ANIMATION isolates svg from parent display and is always centered inside root element.
  return (
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    <Root role={'progressbar'}>
      <SpinnerAnimation style={animationStyle}>
        <svg
          height={size}
          strokeWidth={strokeWidth.toFixed(2)}
          viewBox={viewBox}
          width={size}
        >
          <SpinnerTrack d={SPINNER_TRACK} />
          <SpinnerHead
            d={SPINNER_TRACK}
            pathLength={PATH_LENGTH}
            strokeDasharray={`${PATH_LENGTH} ${PATH_LENGTH}`}
            strokeDashoffset={strokeOffset}
          />
        </svg>
      </SpinnerAnimation>
    </Root>
  );
});

const Root = styled('div')`
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  overflow: visible;
  vertical-align: middle;
`;

const rotate = keyframes`
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
`;

const SpinnerAnimation = styled('div')`
  -webkit-animation: ${rotate} 0.5s linear infinite;
  animation: ${rotate} 0.5s linear infinite;
`;

const SpinnerPath = styled('path')`
  fill-opacity: 0;
`;

const SpinnerTrack = styled(SpinnerPath)`
  stroke: rgba(92, 112, 128, 0.2);
`;

const SpinnerHead = styled(SpinnerPath)`
  stroke: rgba(92, 112, 128, 0.8);
  stroke-linecap: round;
  -webkit-transform-origin: center;
  transform-origin: center;
  -webkit-transition: stroke-dashoffset 0.2s cubic-bezier(0.4, 1, 0.75, 0.9);
  transition: stroke-dashoffset 0.2s cubic-bezier(0.4, 1, 0.75, 0.9);
`;
