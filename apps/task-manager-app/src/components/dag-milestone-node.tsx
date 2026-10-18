import { memoNamed } from 'preact-utils';
import type {
  HighlightState,
  LaidOutNode,
  MilestoneNodeView,
} from '../dag/index.mjs';
import { useDagNodeHandlers } from './use-dag-node-handlers.mjs';

type Props = Readonly<{
  node: LaidOutNode;
  view: MilestoneNodeView;
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
  /** 「コンパクト」: a smaller hexagon, its title alone and cut shorter. */
  compact: boolean;
}>;

/**
 * A milestone: a hexagon, filled once reached and outlined (dashed) before,
 * so it reads as a point to wait for rather than work to do, with its title
 * and, if it has one, its date under it; smaller when compact, its title cut
 * shorter and its date in its tooltip. Opened and moved as a task is
 * (`use-dag-node-handlers.mts`).
 */
export const DagMilestoneNode = memoNamed<Props>(
  'DagMilestoneNode',
  (props) => {
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

    const { width, height } = node;

    const withDate = !compact && view.date !== undefined;

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
        className={`dag-node dag-milestone ${view.reached ? 'reached' : 'pending'}${compact ? ' compact' : ''}${dragging ? ' dragging' : ''}${selected ? ' selected' : ''}`}
        data-e2e={'dag-node'}
        data-highlight={highlight}
        data-node-id={node.id}
        data-outside={outside}
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
          {compact && view.date !== undefined
            ? `${view.title}\n${view.date}`
            : view.title}
        </title>
        <polygon className={'dag-node-shape'} points={hexagon} />
        <text
          className={'dag-node-title'}
          dominantBaseline={'central'}
          textAnchor={'middle'}
          x={width / 2}
          y={withDate ? height / 2 - LINE_OFFSET : height / 2}
        >
          {`${view.awaitingCheck ? '☐ ' : ''}${compact ? view.compactTitle : view.shortTitle}`}
        </text>
        {withDate ? (
          <text
            className={'dag-node-meta'}
            dominantBaseline={'central'}
            textAnchor={'middle'}
            x={width / 2}
            y={height / 2 + LINE_OFFSET}
          >
            {view.date}
          </text>
        ) : undefined}
      </g>
    );
  },
);

/** From the middle of a standard node to the middle of each of its lines. */
const LINE_OFFSET = 9;
