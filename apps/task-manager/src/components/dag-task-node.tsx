import type { InitializedObservable } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import type { TaskNodeView } from '../dag/index.mjs';
import { priorityLabels } from '../view-model/index.mjs';
import type { DagNodeRecord } from './dag-canvas-scene.mjs';
import { dagNodeHandlers } from './dag-node-handlers.mjs';
import { SvgTitle } from './svg-title.js';

type Props = Readonly<{
  record: InitializedObservable<DagNodeRecord<TaskNodeView>>;
}>;

/**
 * A task: a rounded rectangle in the colour of its status, with its title and
 * due date — or, compact, its title alone, with the due date and priority in
 * its tooltip; the colour and the border say whether it can start either way.
 * Its priority is drawn as the issue DAG of `pr-manager` draws one: a
 * pill across the top edge for any but 「中」, the default; a second outline
 * around 「最高」; and 「低」 and 「最低」 faint until pointed at.
 * Focusable; Enter or Space opens it as a tap does, and in 「DAG」 the arrow
 * keys move it.
 */
export const DagTaskNode = ({ record }: Props): JSX.Element => {
  const { node: first } = record.getSnapshot().value;

  const { openNode, onKeyDown } = dagNodeHandlers(
    record.getSnapshot().value.view.ref,
    () => record.getSnapshot().value.movable,
  );

  const compact = view(record, (r) => r.compact);

  return (
    // An SVG has no <button>: the group takes its role, focus and keys.

    <g
      aria-label={view(record, (r) => r.view.ariaLabel)}
      class={view(
        record,
        (r) =>
          `dag-node dag-task status-${r.view.status}${r.compact ? ' compact' : ''}${r.dragging ? ' dragging' : ''}${r.selected ? ' selected' : ''}`,
      )}
      data-e2e={constant('dag-node')}
      data-highlight={view(record, (r) => r.highlight)}
      data-node-id={constant(first.id)}
      data-outside={view(record, (r) => String(r.outside))}
      data-priority={view(record, (r) => String(r.view.priority))}
      data-selected={view(record, (r) => String(r.selected))}
      opacity={view(record, (r) => r.opacity)}
      role={constant('button')}
      tabindex={constant(0)}
      transform={view(record, ({ node }) => `translate(${node.x} ${node.y})`)}
      onClick={openNode}
      onKeyDown={onKeyDown}
    >
      <SvgTitle>
        {view(record, ({ view: v, compact: isCompact }) =>
          isCompact
            ? `${v.title}\n${v.due}・優先度 ${priorityLabels[v.priority]}`
            : v.title,
        )}
      </SvgTitle>
      <g class={constant('dag-node-body')}>
        <If
          cond={view(record, (r) => r.view.priority === 1)}
          then={
            <rect
              class={constant('dag-node-ring')}
              height={view(record, (r) => r.node.height + 2 * RING_GAP)}
              rx={view(record, (r) => cornerOf(r) + RING_GAP)}
              width={view(record, (r) => r.node.width + 2 * RING_GAP)}
              x={constant(-RING_GAP)}
              y={constant(-RING_GAP)}
            />
          }
        />
        <rect
          class={constant('dag-node-shape')}
          height={view(record, (r) => r.node.height)}
          rx={view(record, cornerOf)}
          width={view(record, (r) => r.node.width)}
        />
        <If
          cond={compact}
          then={
            <text
              class={constant('dag-node-title')}
              dominant-baseline={constant('central')}
              x={constant(10)}
              y={view(record, (r) => r.node.height / 2)}
            >
              {view(record, (r) => r.view.compactTitle)}
            </text>
          }
          else={
            <>
              <text
                class={constant('dag-node-title')}
                x={constant(12)}
                y={constant(22)}
              >
                {view(record, (r) => r.view.shortTitle)}
              </text>
              <text
                class={view(record, (r) =>
                  r.view.overdue ? 'dag-node-meta overdue' : 'dag-node-meta',
                )}
                x={constant(12)}
                y={constant(42)}
              >
                {view(record, (r) => r.view.due)}
              </text>
            </>
          }
        />
        <If
          cond={view(record, (r) => r.view.warning)}
          then={
            <text
              class={constant('dag-node-warning')}
              dominant-baseline={view(record, (r) =>
                r.compact ? 'central' : undefined,
              )}
              text-anchor={constant('end')}
              x={view(record, (r) => r.node.width - (r.compact ? 8 : 10))}
              y={view(record, (r) => (r.compact ? r.node.height / 2 : 42))}
            >
              {constant('⚠')}
            </text>
          }
        />
        <If
          cond={view(record, (r) => r.view.priority !== 3)}
          then={
            <g
              class={constant('dag-node-priority')}
              transform={view(
                record,
                (r) =>
                  `translate(${r.node.width - PRIORITY_INSET - PRIORITY_WIDTH} ${-PRIORITY_HEIGHT / 2})`,
              )}
            >
              <rect
                height={constant(PRIORITY_HEIGHT)}
                rx={constant(PRIORITY_HEIGHT / 2)}
                width={constant(PRIORITY_WIDTH)}
              />
              <text
                dominant-baseline={constant('central')}
                text-anchor={constant('middle')}
                x={constant(PRIORITY_WIDTH / 2)}
                y={constant(PRIORITY_HEIGHT / 2)}
              >
                {view(record, (r) => priorityLabels[r.view.priority])}
              </text>
            </g>
          }
        />
      </g>
    </g>
  );
};

/** The corners: rounder on a standard node. */
const cornerOf = (record: DagNodeRecord): number => (record.compact ? 6 : 8);

/** Between a 「最高」 task's shape and its second outline. */
const RING_GAP = 4;

/** Wide enough for 「最高」 in 10px bold. */
const PRIORITY_WIDTH = 32;

/** Centred on the top edge, so half of it stands above the node. */
const PRIORITY_HEIGHT = 14;

/** From the right end, clear of the rounded corner. */
const PRIORITY_INSET = 10;
