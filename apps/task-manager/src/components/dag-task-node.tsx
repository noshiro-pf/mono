import type { InitializedObservable } from 'synstate';
import { constant, For, If, view, type JSX } from 'synstate-dom';
import {
  LARGE_NODE_LINE_HEIGHT,
  textWidthUnits,
  type TaskNodeView,
} from '../dag/index.mjs';
import { m } from '../i18n/index.mjs';
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
 * its tooltip; or, large, its title on up to three lines above the due date;
 * the colour and the border say whether it can start at every size.
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

  const compact = view(record, (r) => r.size === 'compact');

  const large = view(record, (r) => r.size === 'large');

  return (
    // An SVG has no <button>: the group takes its role, focus and keys.

    <g
      aria-label={view(record, (r) => r.view.ariaLabel)}
      class={view(
        record,
        (r) =>
          `dag-node dag-task status-${r.view.status}${r.size === 'standard' ? '' : ` ${r.size}`}${r.dragging ? ' dragging' : ''}${r.selected ? ' selected' : ''}`,
      )}
      data-e2e={constant('dag-node')}
      data-highlight={view(record, (r) => r.highlight)}
      data-node-id={constant(first.id)}
      data-outside={view(record, (r) => r.outside.toString())}
      data-priority={view(record, (r) => r.view.priority.toString())}
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
          size === 'compact'
            ? m.dag.compactTitle(v.title, v.due, priorityLabels[v.priority])
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
              <If
                cond={large}
                then={
                  <For
                    items={view(record, (r) =>
                      r.view.largeTitle.map((text, line) => ({
                        text,
                        y: largeLineY(r, line),
                      })),
                    )}
                    key={(_, line) => line}
                  >
                    {(line$) => (
                      <text
                        class={constant('dag-node-title')}
                        dominant-baseline={constant('central')}
                        x={constant(12)}
                        y={view(line$, ({ y }) => y)}
                      >
                        {view(line$, ({ text }) => text)}
                      </text>
                    )}
                  </For>
                }
                else={
                  <text
                    class={constant('dag-node-title')}
                    x={constant(12)}
                    y={constant(22)}
                  >
                    {view(record, (r) => r.view.shortTitle)}
                  </text>
                }
              />
              <text
                class={view(record, (r) =>
                  r.view.overdue ? 'dag-node-meta overdue' : 'dag-node-meta',
                )}
                x={constant(12)}
                y={view(record, metaY)}
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
                r.size === 'compact' ? 'central' : undefined,
              )}
              text-anchor={constant('end')}
              x={view(
                record,
                (r) => r.node.width - (r.size === 'compact' ? 8 : 10),
              )}
              y={view(record, (r) =>
                r.size === 'compact' ? r.node.height / 2 : metaY(r),
              )}
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
const cornerOf = (record: DagNodeRecord): number =>
  record.size === 'compact' ? 6 : 8;

/** The baseline of the due date: {@link META_INSET} above the bottom. */
const metaY = (record: DagNodeRecord): number =>
  record.node.height - META_INSET;

/**
 * The middle of line `line` of a large node's title: its lines together in the
 * middle of what the due date leaves above it.
 */
const largeLineY = (
  record: DagNodeRecord<TaskNodeView>,
  line: number,
): number =>
  (record.node.height - META_ROOM) / 2 +
  (line - (record.view.largeTitle.length - 1) / 2) * LARGE_NODE_LINE_HEIGHT;

/** As on a standard node, whose due date sits 42 down a 56 high box. */
const META_INSET = 14;

/** The due date's line at the bottom of a node, and the space above it. */
const META_ROOM = 20;

/** Between a 「最高」 task's shape and its second outline. */
const RING_GAP = 4;

/** Room either side of the label. */
const PRIORITY_PADDING = 8;

/** About the width of a narrow character in the pill's 10px bold. */
const PRIORITY_UNIT_WIDTH = 6;

/** Wide enough for the longest priority label, 「最高」 or `Highest`. */
const PRIORITY_WIDTH =
  Math.max(...Object.values(priorityLabels).map(textWidthUnits)) *
    PRIORITY_UNIT_WIDTH +
  PRIORITY_PADDING;

/** Centred on the top edge, so half of it stands above the node. */
const PRIORITY_HEIGHT = 14;

/** From the right end, clear of the rounded corner. */
const PRIORITY_INSET = 10;
