import { memoNamed } from 'preact-utils';
import { type EdgeGeometry } from '../dag/index.mjs';

type Props = Readonly<{
  edge: EdgeGeometry;
}>;

/**
 * A dependency, from the node depended on to the node that waits: a curve,
 * or a path round the nodes in its way (`dag/edge-routing.mts`), ending in
 * an arrowhead, which the marker turns along the path's last tangent —
 * straight into the node. Its label, `SS` for start-to-start and the lag,
 * sits on the middle of the path.
 */
export const DagEdge = memoNamed<Props>('DagEdge', (props) => {
  const { edge } = props;

  const { path, labelBox, label, from, to, routed } = edge;

  return (
    <g
      className={'dag-edge'}
      data-e2e={'dag-edge'}
      data-from={from}
      data-routed={routed}
      data-to={to}
    >
      <path
        className={'dag-edge-line'}
        d={path}
        markerEnd={'url(#dag-arrow)'}
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
