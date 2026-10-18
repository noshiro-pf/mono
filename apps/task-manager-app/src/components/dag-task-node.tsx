import { memoNamed } from 'preact-utils';
import type {
  HighlightState,
  LaidOutNode,
  TaskNodeView,
} from '../dag/index.mjs';
import { priorityLabels } from '../view-model/index.mjs';
import { useDagNodeHandlers } from './use-dag-node-handlers.mjs';

type Props = Readonly<{
  node: LaidOutNode;
  view: TaskNodeView;
  /** Being dragged, and drawn lifted. */
  dragging: boolean;
  /** Selected by the lasso, and drawn outlined. */
  selected: boolean;
  /** Moved by the arrow keys: in the view modes the reader arranges. */
  movable: boolean;
  /** Brought forward or dimmed by the arc diagram's highlight. */
  highlight: HighlightState;
  /**
   * Outside the filter, and drawn faint: there only as what a node in it
   * waits for or is waited for by (`dag/node-filter.mts`).
   */
  outside: boolean;
  /** While it fades out of or into a view mode; `undefined` for opaque. */
  opacity: number | undefined;
  /** 「コンパクト」: the title alone, on one line. */
  compact: boolean;
}>;

/**
 * A task: a rounded rectangle in the colour of its status, with its title and
 * due date — or, compact, its title alone, with the due date and priority in
 * its tooltip; the colour and the border say whether it can start either way.
 * Its priority is drawn as the issue DAG of `pr-manager-app` draws one: a
 * pill across the top edge for any but 「中」, the default; a second outline
 * around 「最高」; and 「低」 and 「最低」 faint until pointed at.
 * Focusable; Enter or Space opens it as a tap does, and in 「DAG」 the arrow
 * keys move it.
 */
export const DagTaskNode = memoNamed<Props>('DagTaskNode', (props) => {
  const {
    node,
    view,
    dragging,
    selected,
    movable,
    highlight,
    outside,
    opacity,
    compact,
  } = props;

  const { openNode, onKeyDown } = useDagNodeHandlers(view.ref, movable);

  const rx = compact ? 6 : 8;

  return (
    // An SVG has no <button>: the group takes its role, focus and keys.
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    <g
      aria-label={view.ariaLabel}
      className={`dag-node dag-task status-${view.status}${compact ? ' compact' : ''}${dragging ? ' dragging' : ''}${selected ? ' selected' : ''}`}
      data-e2e={'dag-node'}
      data-highlight={highlight}
      data-node-id={node.id}
      data-outside={outside}
      data-priority={view.priority}
      data-selected={selected}
      opacity={opacity}
      role={'button'}
      // Lower case: Preact sets an SVG element's props as attributes, and
      // an SVG attribute `tabIndex` is not `tabindex` — no focus at all.
      // eslint-disable-next-line react/no-unknown-property
      tabindex={0}
      transform={`translate(${node.x} ${node.y})`}
      onClick={openNode}
      onKeyDown={onKeyDown}
    >
      <title>
        {compact
          ? `${view.title}\n${view.due}・優先度 ${priorityLabels[view.priority]}`
          : view.title}
      </title>
      <g className={'dag-node-body'}>
        {view.priority === 1 ? (
          <rect
            className={'dag-node-ring'}
            height={node.height + 2 * RING_GAP}
            rx={rx + RING_GAP}
            width={node.width + 2 * RING_GAP}
            x={-RING_GAP}
            y={-RING_GAP}
          />
        ) : undefined}
        <rect
          className={'dag-node-shape'}
          height={node.height}
          rx={rx}
          width={node.width}
        />
        {compact ? (
          <text
            className={'dag-node-title'}
            dominantBaseline={'central'}
            x={10}
            y={node.height / 2}
          >
            {view.compactTitle}
          </text>
        ) : (
          <>
            <text className={'dag-node-title'} x={12} y={22}>
              {view.shortTitle}
            </text>
            <text
              className={`dag-node-meta${view.overdue ? ' overdue' : ''}`}
              x={12}
              y={42}
            >
              {view.due}
            </text>
          </>
        )}
        {view.warning ? (
          <text
            className={'dag-node-warning'}
            dominantBaseline={compact ? 'central' : undefined}
            textAnchor={'end'}
            x={node.width - (compact ? 8 : 10)}
            y={compact ? node.height / 2 : 42}
          >
            {'⚠'}
          </text>
        ) : undefined}
        {view.priority === 3 ? undefined : (
          <g
            className={'dag-node-priority'}
            transform={`translate(${node.width - PRIORITY_INSET - PRIORITY_WIDTH} ${-PRIORITY_HEIGHT / 2})`}
          >
            <rect
              height={PRIORITY_HEIGHT}
              rx={PRIORITY_HEIGHT / 2}
              width={PRIORITY_WIDTH}
            />
            <text
              dominantBaseline={'central'}
              textAnchor={'middle'}
              x={PRIORITY_WIDTH / 2}
              y={PRIORITY_HEIGHT / 2}
            >
              {priorityLabels[view.priority]}
            </text>
          </g>
        )}
      </g>
    </g>
  );
});

/** Between a 「最高」 task's shape and its second outline. */
const RING_GAP = 4;

/** Wide enough for 「最高」 in 10px bold. */
const PRIORITY_WIDTH = 32;

/** Centred on the top edge, so half of it stands above the node. */
const PRIORITY_HEIGHT = 14;

/** From the right end, clear of the rounded corner. */
const PRIORITY_INSET = 10;
