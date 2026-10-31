import * as React from 'react';
import {
  type Pointer,
  centerOf,
  colors,
  monoFont,
  nodeRadius,
  pointerColors,
} from './trace-shared.mjs';
import type { NodeRow, TraceNode } from './trace-step.mjs';

type Props = Readonly<{
  node: TraceNode;
  row: NodeRow;
  active: boolean;
  freshTokens: readonly string[];
  markedByOpenUpdate: boolean;
  pointers: readonly Pointer[];
}>;

export const TraceGraphNode = React.memo<Props>((props) => {
  const { node, row, active, freshTokens, markedByOpenUpdate, pointers } =
    props;

  const c = centerOf(node);

  const fill = row.emitted
    ? colors.emitted
    : row.skipped
      ? colors.skipped
      : colors.idle;

  const current = freshTokens.includes(row.updateToken);

  const tagsTop = c.y - (pointers.length * 19) / 2;

  return (
    <g>
      {markedByOpenUpdate ? (
        <circle
          cx={c.x}
          cy={c.y}
          fill={'none'}
          r={nodeRadius + 6}
          stroke={colors.queued}
          strokeDasharray={'4 3'}
          strokeWidth={3}
        />
      ) : undefined}
      <circle
        cx={c.x}
        cy={c.y}
        fill={fill}
        r={nodeRadius}
        stroke={active ? colors.active : 'none'}
        strokeWidth={active ? 5 : 0}
      />
      <text
        dominantBaseline={'central'}
        fill={colors.nodeText}
        fontFamily={monoFont}
        fontSize={node.id.length > 1 ? 15 : 18}
        fontWeight={700}
        textAnchor={'middle'}
        x={c.x}
        y={c.y + 1}
      >
        {node.id}
      </text>

      {/* value and token, to the right */}
      <text
        dominantBaseline={'central'}
        fill={row.emitted ? colors.fresh : colors.values}
        fontFamily={monoFont}
        fontSize={14}
        fontWeight={row.emitted ? 700 : 400}
        x={c.x + nodeRadius + 10}
        y={c.y - 9}
      >
        {row.snapshot}
      </text>
      <g>
        <rect
          fill={current ? colors.token : colors.tokenStale}
          height={18}
          rx={9}
          width={30}
          x={c.x + nodeRadius + 8}
          y={c.y + 2}
        />
        <text
          dominantBaseline={'central'}
          fill={colors.background}
          fontFamily={monoFont}
          fontSize={12}
          fontWeight={700}
          textAnchor={'middle'}
          x={c.x + nodeRadius + 23}
          y={c.y + 11}
        >
          {row.updateToken}
        </text>
      </g>

      {/* operator, below */}
      <text
        fill={colors.op}
        fontFamily={monoFont}
        fontSize={11}
        textAnchor={'middle'}
        x={c.x}
        y={c.y + nodeRadius + 15}
      >
        {node.op}
      </text>

      {/* pointers, to the left */}
      {pointers.map((p, i) => (
        <g key={p.label}>
          <rect
            fill={pointerColors[p.kind]}
            height={17}
            rx={4}
            width={p.label.length * 7 + 10}
            x={c.x - nodeRadius - 10 - (p.label.length * 7 + 10)}
            y={tagsTop + i * 19}
          />
          <text
            dominantBaseline={'central'}
            fill={colors.background}
            fontFamily={monoFont}
            fontSize={11.5}
            fontWeight={700}
            textAnchor={'middle'}
            x={c.x - nodeRadius - 10 - (p.label.length * 7 + 10) / 2}
            y={tagsTop + i * 19 + 9}
          >
            {p.label}
          </text>
        </g>
      ))}
    </g>
  );
});

TraceGraphNode.displayName = 'TraceGraphNode';
