import * as React from 'react';
import { colors, laneWidth, laneX, monoFont } from './animation-shared.mjs';

type Props = Readonly<{
  y: number;
  height: number;
  label: string;
  active: boolean;
  reduceMotion: boolean;
}>;

export const AnimationLane = React.memo<Props>(
  ({ y, height, label, active, reduceMotion }) => (
    <g>
      <rect
        fill={active ? colors.laneActive : colors.laneBackground}
        height={height}
        rx={8}
        stroke={active ? colors.visiting : colors.laneBorder}
        strokeWidth={active ? 2 : 1}
        style={reduceMotion ? undefined : fadeTransition}
        width={laneWidth}
        x={laneX}
        y={y - height / 2}
      />
      <text
        dominantBaseline={'central'}
        fill={colors.mutedText}
        fontFamily={monoFont}
        fontSize={13}
        x={laneX + 12}
        y={y}
      >
        {label}
      </text>
    </g>
  ),
);

AnimationLane.displayName = 'AnimationLane';

const fadeTransition: React.CSSProperties = {
  transition: 'fill 300ms ease, stroke 300ms ease',
} as const;
