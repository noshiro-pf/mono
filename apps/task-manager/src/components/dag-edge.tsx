import { type InitializedObservable, map } from 'synstate';
import { constant, If, inlineMap, type JSX } from 'synstate-dom';
import type { DagEdgeRecord } from './dag-canvas-scene.mjs';
import { DagEdgeLabel } from './dag-edge-label.js';

type Props = Readonly<{
  record: InitializedObservable<DagEdgeRecord>;
}>;

/**
 * A dependency, from the node depended on to the node that waits: a curve, or a
 * path round the nodes in its way (`dag/edge-routing.mts`), ending in an
 * arrowhead, which the marker turns along the path's last tangent — straight
 * into the node. Its label, `SS` for start-to-start and the lag, sits on the
 * middle of the path.
 *
 * A wider, unpainted stroke along the path takes the pointer, so that the line
 * is easy to point at: pointed at, it is drawn in the focus colour, and
 * clicked, it is selected (`dag-canvas.tsx`) and stays so.
 *
 * An `implied` edge, the order in time of two milestones or of a deadline and a
 * milestone, is drawn dashed and with nothing to point at: it is no dependency,
 * so there is nothing to delete.
 */
export const DagEdge = ({ record }: Props): JSX.Element => {
  const path = record.pipe(map(({ edge }) => edge.path));

  return (
    <g
      class={constant('dag-edge')}
      data-e2e={constant('dag-edge')}
      data-edge-id={inlineMap(record, ({ edge }) => edge.id)}
      data-from={inlineMap(record, ({ edge }) => edge.from)}
      data-implied={inlineMap(record, ({ edge }) => edge.implied.toString())}
      data-routed={inlineMap(record, ({ edge }) => edge.routed.toString())}
      data-selected={inlineMap(record, ({ selected }) => selected.toString())}
      data-to={inlineMap(record, ({ edge }) => edge.to)}
    >
      <path
        class={constant('dag-edge-line')}
        d={path}
        marker-end={constant('url(#dag-arrow)')}
      />
      <If
        cond={record.pipe(map(({ edge }) => !edge.implied))}
        then={
          <path
            class={constant('dag-edge-hit')}
            d={path}
            data-e2e={constant('dag-edge-hit')}
          />
        }
      />
      <DagEdgeLabel pick={({ edge }) => edge} source={record} />
    </g>
  );
};
