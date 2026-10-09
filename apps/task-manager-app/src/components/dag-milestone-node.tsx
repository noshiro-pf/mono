import { memoNamed } from 'preact-utils';
import {
  type HighlightState,
  type LaidOutNode,
  type MilestoneNodeView,
} from '../dag/index.mjs';
import { useDagNodeHandlers } from './use-dag-node-handlers.mjs';

type Props = Readonly<{
  node: LaidOutNode;
  view: MilestoneNodeView;
  /** Being dragged, and drawn lifted. */
  dragging: boolean;
  /** Moved by the arrow keys: in the view modes the reader arranges. */
  movable: boolean;
  /** Brought forward or dimmed by the arc diagram's highlight. */
  highlight: HighlightState;
  /** While it fades out of or into a view mode; `undefined` for opaque. */
  opacity: number | undefined;
  /** 「コンパクト」: a smaller hexagon, its title cut shorter. */
  compact: boolean;
}>;

/**
 * A milestone: a hexagon, filled once reached and outlined (dashed) before,
 * so it reads as a point to wait for rather than work to do; smaller when
 * compact, its title cut shorter. Opened and
 * moved as a task is (`use-dag-node-handlers.mts`).
 */
export const DagMilestoneNode = memoNamed<Props>(
  'DagMilestoneNode',
  (props) => {
    const { node, view, dragging, movable, highlight, opacity, compact } =
      props;

    const { openNode, onKeyDown } = useDagNodeHandlers(view.ref, movable);

    const { width, height } = node;

    const inset = height / 2;

    const hexagon = [
      [inset, 0],
      [width - inset, 0],
      [width, height / 2],
      [width - inset, height],
      [inset, height],
      [0, height / 2],
    ]
      .map(([x, y]) => `${x},${y}`)
      .join(' ');

    return (
      // An SVG has no <button>: the group takes its role, focus and keys.
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      <g
        aria-label={view.ariaLabel}
        className={`dag-node dag-milestone ${view.reached ? 'reached' : 'pending'}${compact ? ' compact' : ''}${dragging ? ' dragging' : ''}`}
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
        <title>{view.title}</title>
        <polygon className={'dag-node-shape'} points={hexagon} />
        <text
          className={'dag-node-title'}
          dominantBaseline={'central'}
          textAnchor={'middle'}
          x={width / 2}
          y={height / 2}
        >
          {`${view.awaitingCheck ? '☐ ' : ''}${compact ? view.compactTitle : view.shortTitle}`}
        </text>
      </g>
    );
  },
);
