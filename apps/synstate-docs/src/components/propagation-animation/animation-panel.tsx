import * as React from 'react';
import { AnimationLane } from './animation-lane.jsx';
import {
  chipWidth,
  chipX,
  colors,
  laneWidth,
  laneX,
  monoFont,
  rowY,
} from './animation-shared.mjs';
import type { Panel } from './frame.mjs';

type Props = Readonly<{
  panel: Panel;
  maxDepth: number;
  sourceId: string;
  update: number;
  reduceMotion: boolean;
}>;

/** Where the algorithm keeps its pending work: buckets, a queue, or calls. */
export const AnimationPanel = React.memo<Props>((props) => {
  const { panel, maxDepth, sourceId, update, reduceMotion } = props;

  switch (panel.type) {
    case 'buckets':
      return (
        <g>
          {Array.from({ length: maxDepth + 1 }, (_, depth) => (
            <g key={depth}>
              <AnimationLane
                active={panel.activeDepth === depth}
                height={laneHeight}
                label={
                  depth === 0
                    ? `queue${update > 0 ? ` t${update.toString()}` : ''}`
                    : `bucket[${depth.toString()}]`
                }
                reduceMotion={reduceMotion}
                y={rowY(depth)}
              />
              {depth === 0 ? (
                <text
                  dominantBaseline={'central'}
                  fill={colors.text}
                  fontFamily={monoFont}
                  fontSize={13}
                  x={chipX(0) - chipWidth / 2}
                  y={rowY(0)}
                >
                  {`manager ${sourceId}`}
                </text>
              ) : undefined}
            </g>
          ))}
        </g>
      );

    case 'priorityQueue':
      return (
        <AnimationLane
          active={false}
          height={laneHeight + 14}
          label={'queue'}
          reduceMotion={reduceMotion}
          y={rowY(1)}
        />
      );

    case 'callStack': {
      const stackTop = rowY(0) - laneHeight / 2;

      return (
        <g fontFamily={monoFont} fontSize={14}>
          <rect
            fill={colors.laneBackground}
            height={rowY(maxDepth) + laneHeight / 2 - stackTop}
            rx={8}
            stroke={colors.laneBorder}
            width={laneWidth}
            x={laneX}
            y={stackTop}
          />
          <text
            fill={colors.mutedText}
            fontSize={13}
            x={laneX + 12}
            y={stackTop + 22}
          >
            {'call stack'}
          </text>
          {panel.calls.map((call, i) => (
            <text
              // eslint-disable-next-line react/no-array-index-key -- a call is identified by its depth in the stack
              key={i}
              fill={
                i === panel.calls.length - 1 ? colors.visiting : colors.text
              }

              fontWeight={i === panel.calls.length - 1 ? 700 : 400}
              x={laneX + 12 + i * 12}
              y={stackTop + 52 + i * 28}
            >
              {`${i === 0 ? '' : '└ '}${call}`}
            </text>
          ))}
        </g>
      );
    }
  }
});

AnimationPanel.displayName = 'AnimationPanel';

const laneHeight = 60;
