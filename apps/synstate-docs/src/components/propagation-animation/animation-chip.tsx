import * as React from 'react';
import {
  type Point,
  chipWidth,
  colors,
  monoFont,
  translate,
} from './animation-shared.mjs';
import type { Chip } from './frame.mjs';

type Props = Readonly<{
  chip: Chip;
  from: Point;
  to: Point;
  reduceMotion: boolean;
}>;

export const AnimationChip = React.memo<Props>((props) => {
  const { chip, from, to, reduceMotion } = props;

  const ref = React.useRef<SVGGElement>(null);

  // Where the chip first appeared: it flies in from the parent that queued
  // it, once, when it is mounted.
  const mounted = React.useRef({ from, to, chip, reduceMotion });

  React.useLayoutEffect(() => {
    const m = mounted.current;

    if (m.reduceMotion || m.chip.leaving || ref.current === null) {
      return;
    }

    ref.current.animate(
      [
        { transform: translate(m.from), opacity: 0.2 },
        { transform: translate(m.to), opacity: 1 },
      ],
      { duration: chipFlightMs, easing: 'ease-out' },
    );
  }, []);

  // A string, so that the memo holds while the chip stays put: `to` is a new
  // object on every render.
  const transform = translate(to);

  const style = React.useMemo<React.CSSProperties>(
    () => ({
      transform,
      opacity: chip.leaving ? 0 : 1,
      transition: reduceMotion
        ? 'none'
        : `transform ${chipFlightMs.toString()}ms ease, opacity ${chipFlightMs.toString()}ms ease`,
    }),
    [transform, chip.leaving, reduceMotion],
  );

  return (
    <g ref={ref} style={style}>
      <rect
        fill={colors.chip}
        height={chipHeight}
        rx={6}
        stroke={colors.chipBorder}
        strokeWidth={2}
        width={chipWidth}
        x={-chipWidth / 2}
        y={-chipHeight / 2}
      />
      <text
        dominantBaseline={'central'}
        fill={colors.nodeText}
        fontFamily={monoFont}
        fontSize={17}
        fontWeight={700}
        textAnchor={'middle'}
        y={1}
      >
        {chip.node}
      </text>
      {chip.note === undefined ? undefined : (
        <text
          dominantBaseline={'central'}
          fill={colors.mutedText}
          fontFamily={monoFont}
          fontSize={11}
          textAnchor={'middle'}
          y={chipHeight / 2 + 11}
        >
          {chip.note}
        </text>
      )}
    </g>
  );
});

AnimationChip.displayName = 'AnimationChip';

const chipFlightMs = 600;

const chipHeight = 34;
