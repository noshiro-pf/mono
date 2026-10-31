import * as React from 'react';
import { Num } from 'ts-data-forge';
import { AnimationChip } from './animation-chip.jsx';
import { AnimationLegend } from './animation-legend.jsx';
import { AnimationNode } from './animation-node.jsx';
import { AnimationPanel } from './animation-panel.jsx';
import {
  type Point,
  chipX,
  colors,
  monoFont,
  nodeRadius,
  rowY,
} from './animation-shared.mjs';
import type { Chip, EdgeHighlight, Frame, Panel, Trace } from './frame.mjs';

type Props = Readonly<{
  animation: Trace;
  frame: Frame;
  reduceMotion: boolean;
}>;

export const AnimationDrawing = React.memo<Props>((props) => {
  const { animation, frame, reduceMotion } = props;

  const { scenario } = animation;

  const maxDepth = Math.max(...scenario.nodes.map((n) => n.depth));

  const height = rowY(maxDepth) + nodeRadius + 52;

  const nodeX = new Map(scenario.nodes.map((n) => [n.id, n.x]));

  const nodeDepth = new Map(scenario.nodes.map((n) => [n.id, n.depth]));

  const center = (id: string): Point =>
    ({
      x: nodeX.get(id) ?? 0,
      y: rowY(nodeDepth.get(id) ?? 0),
    }) as const;

  const highlightOf = (from: string, to: string): EdgeHighlight | undefined =>
    frame.edges.find((e) => e.from === from && e.to === to);

  const sourceId = scenario.nodes[0]?.id ?? '';

  return (
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG drawing cannot be an <img>; role="img" makes it one labelled image
    <svg
      aria-label={animation.label}
      role={'img'}
      style={svgStyle}
      viewBox={`0 0 ${viewWidth.toString()} ${height.toString()}`}
    >
      <defs>
        {Object.entries(edgeColors).map(([kind, color]) => (
          <marker
            key={kind}
            id={`queue-arrow-${kind}`}
            markerHeight={7}
            markerWidth={7}
            orient={'auto'}
            refX={10}
            refY={5}
            viewBox={'0 0 10 10'}
          >
            <path d={'M 0 0 L 10 5 L 0 10 z'} fill={color} />
          </marker>
        ))}
      </defs>

      <rect
        fill={colors.background}
        height={height}
        rx={10}
        width={viewWidth}
      />

      <AnimationPanel
        maxDepth={maxDepth}
        panel={frame.panel}
        reduceMotion={reduceMotion}
        sourceId={sourceId}
        update={animation.showTokens ? frame.update : 0}
      />

      {/* Edges */}
      {scenario.nodes.flatMap((child) =>
        child.parents.map((parentId) => {
          const h = highlightOf(parentId, child.id);

          const kind = h?.kind ?? 'none';

          const from = center(parentId);

          const to = center(child.id);

          const len = Math.hypot(to.x - from.x, to.y - from.y);

          const ux = Num.isNonZero(len) ? Num.div(to.x - from.x, len) : 0;

          const uy = Num.isNonZero(len) ? Num.div(to.y - from.y, len) : 0;

          return (
            <line
              key={`${parentId}-${child.id}`}
              markerEnd={`url(#queue-arrow-${kind})`}
              stroke={edgeColors[kind]}
              strokeDasharray={
                kind === 'stale' || kind === 'already' ? '6 5' : undefined
              }
              strokeWidth={kind === 'none' ? 2 : 3.5}
              style={reduceMotion ? undefined : strokeTransition}
              x1={from.x + ux * nodeRadius}
              x2={to.x - ux * (nodeRadius + 4)}
              y1={from.y + uy * nodeRadius}
              y2={to.y - uy * (nodeRadius + 4)}
            />
          );
        }),
      )}

      {/* Operator labels */}
      {scenario.nodes.map((n) =>
        n.op === undefined ? undefined : (
          <g key={`op-${n.id}`}>
            <rect
              fill={colors.opBackground}
              height={24}
              rx={4}
              width={n.op.text.length * 7.8 + 16}
              x={n.op.x - (n.op.text.length * 7.8 + 16) / 2}
              y={n.op.y - 12}
            />
            <text
              dominantBaseline={'central'}
              fill={colors.opText}
              fontFamily={monoFont}
              fontSize={13}
              textAnchor={'middle'}
              x={n.op.x}
              y={n.op.y}
            >
              {n.op.text}
            </text>
          </g>
        ),
      )}

      {/* Nodes */}
      {scenario.nodes.map((n) => {
        const state = frame.nodes[n.id];

        return state === undefined ? undefined : (
          <AnimationNode
            key={n.id}
            active={frame.activeNode === n.id}
            center={center(n.id)}
            currentUpdate={frame.update}
            id={n.id}
            reduceMotion={reduceMotion}
            showToken={animation.showTokens}
            state={state}
            valuesSide={n.valuesSide}
          />
        );
      })}

      {/* Queued nodes */}
      {chipsOf(frame.panel).map((chip) => (
        <AnimationChip
          key={chip.key}
          chip={chip}
          from={center(chip.from)}
          reduceMotion={reduceMotion}
          to={chip.leaving ? center(chip.node) : slotOf(frame.panel, chip)}
        />
      ))}

      <AnimationLegend items={animation.legend} y={height - 18} />
    </svg>
  );
});

AnimationDrawing.displayName = 'AnimationDrawing';

/** Where a queued chip sits in the panel. */
const slotOf = (panel: Panel, chip: Chip): Point =>
  panel.type === 'priorityQueue'
    ? ({ x: chipX(chip.slot), y: rowY(1) - 6 } as const)
    : ({ x: chipX(chip.slot), y: rowY(chip.lane) } as const);

const chipsOf = (panel: Panel): readonly Chip[] =>
  panel.type === 'callStack' ? ([] as const) : panel.chips;

const viewWidth = 840;

const edgeColors = {
  none: '#90a4ae',
  queue: '#fff59d',
  already: '#fff59d',
  emitted: '#69f0ae',
  stale: '#78909c',
  call: '#ff4081',
} as const;

const strokeTransition: React.CSSProperties = {
  transition: 'stroke 300ms ease',
} as const;

const svgStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
} as const;
