import * as React from 'react';
import { Arr } from 'ts-data-forge';
import {
  type Point,
  colors,
  monoFont,
  nodeFill,
  nodeRadius,
} from './animation-shared.mjs';
import type { NodeState } from './frame.mjs';

type Props = Readonly<{
  id: string;
  center: Point;
  state: NodeState;
  active: boolean;
  currentUpdate: number;
  valuesSide: 'left' | 'right';
  showToken: boolean;
  reduceMotion: boolean;
}>;

export const AnimationNode = React.memo<Props>((props) => {
  const {
    id,
    center,
    state,
    active,
    currentUpdate,
    valuesSide,
    showToken,
    reduceMotion,
  } = props;

  const shown = Arr.takeLast(state.history, 7);

  const sign = valuesSide === 'right' ? 1 : -1;

  const valuesX = center.x + sign * (nodeRadius + 12);

  const tokenX = center.x - sign * (nodeRadius + 24);

  const isCurrentToken = state.token === currentUpdate && currentUpdate > 0;

  return (
    <g>
      <circle
        cx={center.x}
        cy={center.y}
        fill={nodeFill[state.status]}
        r={nodeRadius}
        stroke={active ? colors.visiting : 'none'}
        strokeWidth={active ? 5 : 0}
        style={reduceMotion ? undefined : fillTransition}
      />
      <text
        dominantBaseline={'central'}
        fill={colors.nodeText}
        fontFamily={monoFont}
        fontSize={20}
        fontWeight={700}
        textAnchor={'middle'}
        x={center.x}
        y={center.y + 1}
      >
        {id}
      </text>
      {showToken ? (
        <g>
          <rect
            fill={isCurrentToken ? colors.token : colors.tokenStale}
            height={22}
            rx={11}
            width={36}
            x={tokenX - 18}
            y={center.y - 11}
          />
          <text
            dominantBaseline={'central'}
            fill={colors.background}
            fontFamily={monoFont}
            fontSize={13}
            fontWeight={700}
            textAnchor={'middle'}
            x={tokenX}
            y={center.y + 1}
          >
            {`t${state.token.toString()}`}
          </text>
        </g>
      ) : undefined}
      <text
        dominantBaseline={'central'}
        fill={colors.values}
        fontFamily={monoFont}
        fontSize={15}
        textAnchor={valuesSide === 'right' ? 'start' : 'end'}
        x={valuesX}
        y={center.y}
      >
        {shown.map((entry, i) => {
          const isLatest = i === shown.length - 1;

          const fresh = isLatest && state.status === 'emitted';

          return (
            // eslint-disable-next-line react/no-array-index-key -- the values are a sliding window with no identity of their own
            <React.Fragment key={i}>
              <tspan
                fill={
                  entry.glitch
                    ? colors.glitch
                    : fresh
                      ? colors.fresh
                      : colors.values
                }
                fontWeight={fresh || entry.glitch ? 700 : 400}
              >
                {entry.value.toString()}
              </tspan>
              {isLatest ? undefined : <tspan>{', '}</tspan>}
            </React.Fragment>
          );
        })}
      </text>
    </g>
  );
});

AnimationNode.displayName = 'AnimationNode';

const fillTransition: React.CSSProperties = {
  transition: 'fill 400ms ease, stroke-width 200ms ease',
} as const;
