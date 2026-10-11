import { memoNamed } from 'preact-utils';
import type { ArcGeometry, HighlightState } from '../dag/index.mjs';

type Props = Readonly<{
  arc: ArcGeometry;
  /** Brought forward or dimmed while a task is pointed at or focused. */
  highlight: HighlightState;
}>;

/**
 * A dependency in 「アーク」: an arc beside the column from the task depended
 * on to the task that waits (`dag/arc-geometry.mts`), ending in an arrowhead
 * pointing into it. Solid for a dependency of one task on the other, with
 * its label (`SS`, the lag) at the apex; dashed, and unlabelled, for one
 * that goes through milestones, which its name lists. The name is both its
 * `aria-label` and its `<title>`, the tooltip.
 */
export const DagArcEdge = memoNamed<Props>('DagArcEdge', (props) => {
  const { arc, highlight } = props;

  const { path, labelBox, label, from, to, derived, ariaLabel } = arc;

  return (
    // An SVG has no <img>: the group is one, named by its label.
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    <g
      aria-label={ariaLabel}
      className={`dag-edge dag-arc${derived ? ' derived' : ''}`}
      data-derived={derived}
      data-e2e={'dag-arc'}
      data-from={from}
      data-highlight={highlight}
      data-to={to}
      role={'img'}
    >
      <title>{ariaLabel}</title>
      <path
        className={'dag-edge-line'}
        d={path}
        markerEnd={
          highlight === 'on' ? 'url(#dag-arrow-highlight)' : 'url(#dag-arrow)'
        }
      />
      {labelBox === undefined ? undefined : (
        <g className={'dag-edge-label'}>
          <rect
            height={labelBox.height}
            rx={4}
            width={labelBox.width}
            x={labelBox.x}
            y={labelBox.y}
          />
          <text
            dominantBaseline={'central'}
            textAnchor={'middle'}
            x={labelBox.x + labelBox.width / 2}
            y={labelBox.y + labelBox.height / 2}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
});
