import { memoNamed } from 'preact-utils';
import {
  type HighlightState,
  type LaidOutNode,
  type TaskNodeView,
} from '../dag/index.mjs';
import { displayStatusLabels, priorityLabels } from '../view-model/index.mjs';
import { useDagNodeHandlers } from './use-dag-node-handlers.mjs';

type Props = Readonly<{
  node: LaidOutNode;
  view: TaskNodeView;
  /** Being dragged, and drawn lifted. */
  dragging: boolean;
  /** Moved by the arrow keys: in the view modes the reader arranges. */
  movable: boolean;
  /** Brought forward or dimmed by the arc diagram's highlight. */
  highlight: HighlightState;
  /** While it fades out of or into a view mode; `undefined` for opaque. */
  opacity: number | undefined;
  /** 「コンパクト」: the title alone, on one line. */
  compact: boolean;
}>;

/**
 * A task: a rounded rectangle in the colour of its status, with its title,
 * status and priority — or, compact, its title alone, with the status and
 * priority in its tooltip; the colour, the border and the warning say as
 * much either way. Focusable; Enter or Space opens it as a tap does, and in
 * 「DAG」 the arrow keys move it.
 */
export const DagTaskNode = memoNamed<Props>('DagTaskNode', (props) => {
  const { node, view, dragging, movable, highlight, opacity, compact } = props;

  const { openNode, onKeyDown } = useDagNodeHandlers(view.ref, movable);

  const meta =
    `${displayStatusLabels[view.status]}・優先度 ${priorityLabels[view.priority]}` as const;

  return (
    // An SVG has no <button>: the group takes its role, focus and keys.
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    <g
      aria-label={view.ariaLabel}
      className={`dag-node dag-task status-${view.status}${compact ? ' compact' : ''}${dragging ? ' dragging' : ''}`}
      data-e2e={'dag-node'}
      data-highlight={highlight}
      data-node-id={node.id}
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
      <title>{compact ? `${view.title}\n${meta}` : view.title}</title>
      <rect
        className={'dag-node-shape'}
        height={node.height}
        rx={compact ? 6 : 8}
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
          <text className={'dag-node-meta'} x={12} y={42}>
            {meta}
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
    </g>
  );
});
