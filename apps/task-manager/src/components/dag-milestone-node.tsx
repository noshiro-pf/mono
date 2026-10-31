import type { InitializedObservable } from 'synstate';
import { constant, For, If, view, type JSX } from 'synstate-dom';
import {
  LARGE_NODE_LINE_HEIGHT,
  type LaidOutNode,
  type MilestoneNodeView,
} from '../dag/index.mjs';
import type { DagNodeRecord } from './dag-canvas-scene.mjs';
import { dagNodeHandlers } from './dag-node-handlers.mjs';
import { SvgTitle } from './svg-title.js';

type Props = Readonly<{
  record: InitializedObservable<DagNodeRecord<MilestoneNodeView>>;
}>;

/**
 * A milestone: a hexagon, filled once reached and outlined (dashed) before, so
 * it reads as a point to wait for rather than work to do, with its title and,
 * if it has one, its date under it; smaller when compact, its title cut shorter
 * and its date in its tooltip; larger when large, its title on up to three
 * lines. Opened and moved as a task is (`dag-node-handlers.mts`).
 */
export const DagMilestoneNode = ({ record }: Props): JSX.Element => {
  const { node: first } = record.getSnapshot().value;

  const { openNode, onKeyDown } = dagNodeHandlers(
    record.getSnapshot().value.view.ref,
    () => record.getSnapshot().value.movable,
  );

  return (
    // An SVG has no <button>: the group takes its role, focus and keys.

    <g
      aria-label={view(record, (r) => r.view.ariaLabel)}
      class={view(
        record,
        (r) =>
          `dag-node dag-milestone ${r.view.reached ? 'reached' : 'pending'}${r.size === 'standard' ? '' : ` ${r.size}`}${r.dragging ? ' dragging' : ''}${r.selected ? ' selected' : ''}`,
      )}
      data-e2e={constant('dag-node')}
      data-highlight={view(record, (r) => r.highlight)}
      data-node-id={constant(first.id)}
      data-outside={view(record, (r) => r.outside.toString())}
      data-selected={view(record, (r) => r.selected.toString())}
      opacity={view(record, (r) => r.opacity)}
      role={constant('button')}
      tabindex={constant(0)}
      transform={view(record, ({ node }) => `translate(${node.x} ${node.y})`)}
      onClick={openNode}
      onKeyDown={onKeyDown}
    >
      <SvgTitle>
        {view(record, ({ view: v, size }) =>
          size === 'compact' && v.date !== undefined
            ? `${v.title}\n${v.date}`
            : v.title,
        )}
      </SvgTitle>
      <polygon
        class={constant('dag-node-shape')}
        points={view(record, (r) => hexagonOf(r.node))}
      />
      <For
        items={view(record, (r) => {
          const lines = titleLines(r);

          return lines.map(
            (text, line) =>
              ({ text, y: lineY(r, lines.length, line) }) as const,
          );
        })}
        key={(_, line) => line}
      >
        {(line$) => (
          <text
            class={constant('dag-node-title')}
            dominant-baseline={constant('central')}
            text-anchor={constant('middle')}
            x={view(record, (r) => r.node.width / 2)}
            y={view(line$, ({ y }) => y)}
          >
            {view(line$, ({ text }) => text)}
          </text>
        )}
      </For>
      <If
        cond={view(record, withDate)}
        then={
          <text
            class={constant('dag-node-meta')}
            dominant-baseline={constant('central')}
            text-anchor={constant('middle')}
            x={view(record, (r) => r.node.width / 2)}
            y={view(record, (r) => {
              const lines = titleLineCount(r);

              return lineY(r, lines, lines);
            })}
          >
            {view(record, (r) => r.view.date ?? '')}
          </text>
        }
      />
    </g>
  );
};

/** Between the middles of the lines of a standard node. */
const LINE_HEIGHT = 18;

/**
 * The lines of its title — one, cut to fit, or on a large node up to three —
 * with the check box before the first if it is awaited.
 */
const titleLines = ({
  view: v,
  size,
}: DagNodeRecord<MilestoneNodeView>): readonly string[] => {
  const lines =
    size === 'large'
      ? v.largeTitle
      : ([size === 'compact' ? v.compactTitle : v.shortTitle] as const);

  return v.awaitingCheck
    ? lines.map((text, index) => (index === 0 ? `☐ ${text}` : text))
    : lines;
};

/** How many lines `titleLines` gives, without making them. */
const titleLineCount = ({
  view: v,
  size,
}: DagNodeRecord<MilestoneNodeView>): number =>
  size === 'large' ? v.largeTitle.length : 1;

/** Its date under its title: on a standard or large node, when it has one. */
const withDate = (record: DagNodeRecord<MilestoneNodeView>): boolean =>
  record.size !== 'compact' && record.view.date !== undefined;

/**
 * The middle of line `line` of the `titleLinesShown` lines of the title and the
 * date under it, all of them together in the middle of the node.
 */
const lineY = (
  record: DagNodeRecord<MilestoneNodeView>,
  titleLinesShown: number,
  line: number,
): number => {
  const lines = titleLinesShown + (withDate(record) ? 1 : 0);

  return (
    record.node.height / 2 +
    (line - (lines - 1) / 2) *
      (record.size === 'large' ? LARGE_NODE_LINE_HEIGHT : LINE_HEIGHT)
  );
};

const hexagonOf = ({ width, height }: LaidOutNode): string => {
  const inset = height / 2;

  return [
    [inset, 0],
    [width - inset, 0],
    [width, height / 2],
    [width - inset, height],
    [inset, height],
    [0, height / 2],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
};
