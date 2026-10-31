import * as React from 'react';
import { Num } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Lang } from '../constants.mjs';
import { TraceGraphNode } from './trace-graph-node.jsx';
import {
  centerOf,
  colors,
  monoFont,
  nodeRadius,
  pointerColors,
  type Graph,
  type Pointer,
} from './trace-shared.mjs';
import {
  undefinedText,
  type TraceNode,
  type TraceStep,
} from './trace-step.mjs';

type Props = Readonly<{ graph: Graph; step: TraceStep; lang: Lang }>;

/** The graph, with the queue's pointers drawn on the nodes they point at. */
export const TraceGraph = React.memo<Props>((props) => {
  const { graph, step, lang } = props;

  const { nodes, nodeById, viewHeight } = graph;

  const rows = new Map(step.nodes.map((n) => [n.id, n]));

  const pointers = pointersOf(step, nodeById);

  const openTokens: ReadonlySet<string> = new Set(
    step.queues.filter((q) => q.isOpen).map((q) => q.token),
  );

  return (
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG drawing cannot be an <img>; role="img" makes it one labelled image
    <svg
      aria-label={'The graph, with each node’s queue fields'}
      role={'img'}
      viewBox={`0 0 ${viewWidth.toString()} ${viewHeight.toString()}`}
    >
      <defs>
        <marker
          id={'trace-arrow-edge'}
          markerHeight={7}
          markerWidth={7}
          orient={'auto'}
          refX={10}
          refY={5}
          viewBox={'0 0 10 10'}
        >
          <path d={'M 0 0 L 10 5 L 0 10 z'} fill={colors.edge} />
        </marker>
      </defs>

      <rect
        fill={colors.background}
        height={viewHeight}
        rx={10}
        width={viewWidth}
      />

      {nodes.flatMap((child) =>
        child.parents.map((parentId) => {
          const parentNode = nodeById.get(parentId);

          if (parentNode === undefined) {
            return undefined;
          }

          const from = centerOf(parentNode);

          const to = centerOf(child);

          const len = Math.hypot(to.x - from.x, to.y - from.y);

          const ux = Num.isNonZero(len) ? Num.div(to.x - from.x, len) : 0;

          const uy = Num.isNonZero(len) ? Num.div(to.y - from.y, len) : 0;

          return (
            <line
              key={`${parentId}-${child.id}`}
              markerEnd={'url(#trace-arrow-edge)'}
              stroke={colors.edge}
              strokeWidth={2}
              x1={from.x + ux * nodeRadius}
              x2={to.x - ux * (nodeRadius + 4)}
              y1={from.y + uy * nodeRadius}
              y2={to.y - uy * (nodeRadius + 4)}
            />
          );
        }),
      )}

      {nodes.map((n) => {
        const row = rows.get(n.id);

        return row === undefined ? undefined : (
          <TraceGraphNode
            key={n.id}
            active={step.activeNode === n.id}
            freshTokens={step.freshTokens}
            markedByOpenUpdate={openTokens.has(row.queuedFor)}
            node={n}
            pointers={pointers.get(n.id) ?? noPointers}
            row={row}
          />
        );
      })}

      <g fontFamily={monoFont} fontSize={12}>
        {legend.map((item, i) => (
          <g
            key={item.label.en}
            transform={`translate(${(16 + legendOffset(legend, i, lang)).toString()} ${(viewHeight - 16).toString()})`}
          >
            <rect
              fill={item.fill}
              height={12}
              rx={3}
              stroke={item.stroke}
              strokeWidth={2}
              width={12}
              x={0}
              y={-6}
            />
            <text dominantBaseline={'central'} fill={colors.muted} x={18}>
              {item.label[lang]}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
});

TraceGraph.displayName = 'TraceGraph';

/**
 * What points at each node: the slots in use of each bucket set, as
 * `[index][slot]` (prefixed by the token of a nested update's set), and the
 * locals.
 */
const pointersOf = (
  step: TraceStep,
  nodeById: ReadonlyMap<string, TraceNode>,
): ReadonlyMap<string, readonly Pointer[]> => {
  const mut_byNode = new Map<string, Pointer[]>();

  const add = (id: string, pointer: Pointer): void => {
    if (id === undefinedText || !nodeById.has(id)) {
      return;
    }

    const mut_list = mut_byNode.get(id);

    if (mut_list === undefined) {
      mut_byNode.set(id, [pointer]);
    } else {
      mut_list.push(pointer);
    }
  };

  const nested = step.module.bucketSets.length > 1;

  for (const [level, set] of step.module.bucketSets.entries()) {
    const owner = step.queues[level]?.token;

    for (const [index, { nodes, length: used }] of set.entries()) {
      for (const [slot, id] of nodes.entries()) {
        if (slot < used) {
          add(id, {
            label: `${nested && owner !== undefined ? `${owner} ` : ''}[${index.toString()}][${slot.toString()}]`,
            kind: 'bucket',
          });
        }
      }
    }
  }

  for (const l of step.locals) {
    if (pointerLocals.has(l.name)) {
      add(l.value, { label: l.name, kind: 'local' });
    }
  }

  return mut_byNode;
};

/** The locals drawn as a tag on the node they hold. */
const noPointers: readonly Pointer[] = [] as const;

const pointerLocals: ReadonlySet<string> = new Set<string>(['child', 'node']);

const viewWidth = 680;

const legend = [
  {
    label: { en: 'emitted', ja: '発行した' },
    fill: colors.emitted,
    stroke: 'none',
  },
  {
    label: { en: 'did not emit', ja: '発行しなかった' },
    fill: colors.skipped,
    stroke: 'none',
  },
  {
    label: { en: 'open update’s mark', ja: '開いた更新の印' },
    fill: 'none',
    stroke: colors.queued,
  },
  {
    label: { en: '[index][slot]', ja: '[index][slot]' },
    fill: pointerColors.bucket,
    stroke: 'none',
  },
] as const;

/** Where legend item `i` starts: after the items before it, as wide as their labels. */
const legendOffset = (
  items: readonly Readonly<{ label: ReadonlyRecord<Lang, string> }>[],
  i: number,
  lang: Lang,
): number =>
  items
    .slice(0, i)
    .reduce(
      (sum, item) =>
        sum + 18 + item.label[lang].length * (lang === 'ja' ? 12 : 7.3) + 22,
      0,
    );
