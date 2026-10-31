import * as React from 'react';
import type { ReadonlyRecord } from 'ts-type-forge';
import { colors, laneX, monoFont, nodeFill } from './animation-shared.mjs';
import type { LegendKey } from './frame.mjs';

type Props = Readonly<{ items: readonly LegendKey[]; y: number }>;

export const AnimationLegend = React.memo<Props>(({ items, y }) => (
  <g fontFamily={monoFont} fontSize={12}>
    {items.map((key, i) => {
      const item = legendItems[key];

      return (
        <g
          key={key}
          transform={`translate(${legendX(items, i).toString()} ${y.toString()})`}
        >
          <circle
            cx={0}
            cy={0}
            fill={item.fill}
            r={7}
            stroke={item.stroke}
            strokeWidth={item.stroke === 'none' ? 0 : 3}
          />
          <text
            dominantBaseline={'central'}
            fill={colors.mutedText}
            x={14}
            y={1}
          >
            {item.label}
          </text>
        </g>
      );
    })}
  </g>
));

AnimationLegend.displayName = 'AnimationLegend';

const legendItems = {
  emitted: {
    label: 'emitted in this update',
    fill: nodeFill.emitted,
    stroke: 'none',
  },
  visiting: {
    label: 'being visited',
    fill: nodeFill.visiting,
    stroke: colors.visiting,
  },
  skipped: { label: 'did not emit', fill: nodeFill.skipped, stroke: 'none' },
  queued: { label: 'queued', fill: colors.chip, stroke: colors.chipBorder },
  glitch: { label: 'glitch', fill: colors.glitch, stroke: 'none' },
} as const satisfies ReadonlyRecord<
  LegendKey,
  Readonly<{ label: string; fill: string; stroke: string }>
>;

/** Each legend item is as wide as its label. */
const legendX = (items: readonly LegendKey[], index: number): number =>
  laneX +
  8 +
  items
    .slice(0, index)
    .reduce((acc, key) => acc + legendItems[key].label.length * 7.3 + 44, 0);
