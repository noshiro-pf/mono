import { memoNamed } from 'preact-utils';
import type { EdgeGeometry } from '../dag/index.mjs';

type Props = Readonly<{
  edge: EdgeGeometry;
  /** Clicked, and showing the button that deletes it (`dag-canvas.tsx`). */
  selected: boolean;
}>;

/**
 * A dependency, from the node depended on to the node that waits: a curve,
 * or a path round the nodes in its way (`dag/edge-routing.mts`), ending in
 * an arrowhead, which the marker turns along the path's last tangent —
 * straight into the node. Its label, `SS` for start-to-start and the lag,
 * sits on the middle of the path.
 *
 * A wider, unpainted stroke along the path takes the pointer, so that the
 * line is easy to point at: pointed at, it is drawn in the focus colour, and
 * clicked, it is selected (`dag-canvas.tsx`) and stays so.
 *
 * An `implied` edge, the order in time of two milestones, is drawn dashed
 * and with nothing to point at: it is no dependency, so there is nothing to
 * delete.
 */
export const DagEdge = memoNamed<Props>('DagEdge', (props) => {
  const { edge, selected } = props;

  const { path, labelBox, label, from, to, routed, implied } = edge;

  return (
    <g
      className={'dag-edge'}
      data-e2e={'dag-edge'}
      data-edge-id={edge.id}
      data-from={from}
      data-implied={implied}
      data-routed={routed}
      data-selected={selected}
      data-to={to}
    >
      <path
        className={'dag-edge-line'}
        d={path}
        markerEnd={'url(#dag-arrow)'}
      />
      {implied ? undefined : (
        <path className={'dag-edge-hit'} d={path} data-e2e={'dag-edge-hit'} />
      )}
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
