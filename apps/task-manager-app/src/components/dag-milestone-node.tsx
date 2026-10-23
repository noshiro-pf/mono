import type { InitializedObservable } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import type { LaidOutNode, MilestoneNodeView } from '../dag/index.mjs';
import type { DagNodeRecord } from './dag-canvas-scene.mjs';
import { dagNodeHandlers } from './dag-node-handlers.mjs';
import { SvgTitle } from './svg-title.js';

type Props = Readonly<{
  record: InitializedObservable<DagNodeRecord<MilestoneNodeView>>;
}>;

/**
 * A milestone: a hexagon, filled once reached and outlined (dashed) before,
 * so it reads as a point to wait for rather than work to do, with its title
 * and, if it has one, its date under it; smaller when compact, its title cut
 * shorter and its date in its tooltip. Opened and moved as a task is
 * (`dag-node-handlers.mts`).
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
          `dag-node dag-milestone ${r.view.reached ? 'reached' : 'pending'}${r.compact ? ' compact' : ''}${r.dragging ? ' dragging' : ''}${r.selected ? ' selected' : ''}`,
      )}
      data-e2e={constant('dag-node')}
      data-highlight={view(record, (r) => r.highlight)}
      data-node-id={constant(first.id)}
      data-outside={view(record, (r) => String(r.outside))}
      data-selected={view(record, (r) => String(r.selected))}
      opacity={view(record, (r) => r.opacity)}
      role={constant('button')}
      tabindex={constant(0)}
      transform={view(record, ({ node }) => `translate(${node.x} ${node.y})`)}
      onClick={openNode}
      onKeyDown={onKeyDown}
    >
      <SvgTitle>
        {view(record, ({ view: v, compact }) =>
          compact && v.date !== undefined ? `${v.title}\n${v.date}` : v.title,
        )}
      </SvgTitle>
      <polygon
        class={constant('dag-node-shape')}
        points={view(record, (r) => hexagonOf(r.node))}
      />
      <text
        class={constant('dag-node-title')}
        dominant-baseline={constant('central')}
        text-anchor={constant('middle')}
        x={view(record, (r) => r.node.width / 2)}
        y={view(record, (r) =>
          withDate(r) ? r.node.height / 2 - LINE_OFFSET : r.node.height / 2,
        )}
      >
        {view(
          record,
          ({ view: v, compact }) =>
            `${v.awaitingCheck ? '☐ ' : ''}${compact ? v.compactTitle : v.shortTitle}`,
        )}
      </text>
      <If
        cond={view(record, withDate)}
        then={
          <text
            class={constant('dag-node-meta')}
            dominant-baseline={constant('central')}
            text-anchor={constant('middle')}
            x={view(record, (r) => r.node.width / 2)}
            y={view(record, (r) => r.node.height / 2 + LINE_OFFSET)}
          >
            {view(record, (r) => r.view.date ?? '')}
          </text>
        }
      />
    </g>
  );
};

/** From the middle of a standard node to the middle of each of its lines. */
const LINE_OFFSET = 9;

/** Its date under its title: on a standard node, when it has one. */
const withDate = (record: DagNodeRecord<MilestoneNodeView>): boolean =>
  !record.compact && record.view.date !== undefined;

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
